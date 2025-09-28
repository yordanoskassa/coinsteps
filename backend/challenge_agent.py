"""
Challenge Agent - Reusable notification and event handling layer for challenges
"""
import asyncio
import httpx
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from agentmail_client import AgentMailClient
import os
from motor.motor_asyncio import AsyncIOMotorClient
import logging

logger = logging.getLogger(__name__)

class ChallengeAgent:
    """Intelligent agent for handling challenge events and notifications"""
    
    def __init__(self, db_client: AsyncIOMotorClient):
        self.db = db_client.coinstep
        self.email_client = AgentMailClient()
        
    async def handle_challenge_start(self, challenge_id: str, started_by_user: str) -> Dict[str, Any]:
        """Handle challenge start event and notify participants"""
        try:
            # Get challenge details
            challenge = await self.db.challenges.find_one({"_id": challenge_id})
            if not challenge:
                return {"success": False, "error": "Challenge not found"}
            
            # Update challenge status to active
            await self.db.challenges.update_one(
                {"_id": challenge_id},
                {
                    "$set": {
                        "status": "active",
                        "started_at": datetime.utcnow(),
                        "started_by": started_by_user
                    }
                }
            )
            
            # Get all participants
            participants = challenge.get("participants", [])
            starter_user = await self.db.users.find_one({"username": started_by_user})
            
            # Send notifications to all other participants
            notification_results = []
            for participant in participants:
                if participant != started_by_user:
                    result = await self._send_challenge_started_notification(
                        challenge, participant, starter_user
                    )
                    notification_results.append(result)
            
            return {
                "success": True,
                "challenge_id": challenge_id,
                "notifications_sent": len(notification_results),
                "results": notification_results
            }
            
        except Exception as e:
            logger.error(f"Error handling challenge start: {e}")
            return {"success": False, "error": str(e)}
    
    async def handle_challenge_end_early(self, challenge_id: str, ended_by_user: str, reason: str = "Early termination") -> Dict[str, Any]:
        """Handle early challenge termination and notify participants"""
        try:
            # Get challenge details
            challenge = await self.db.challenges.find_one({"_id": challenge_id})
            if not challenge:
                return {"success": False, "error": "Challenge not found"}
            
            # Update challenge status
            await self.db.challenges.update_one(
                {"_id": challenge_id},
                {
                    "$set": {
                        "status": "ended_early",
                        "ended_at": datetime.utcnow(),
                        "ended_by": ended_by_user,
                        "end_reason": reason
                    }
                }
            )
            
            # Refund stakes to all participants
            stake_amount = challenge.get("stake", 0)
            participants = challenge.get("participants", [])
            
            for participant in participants:
                await self.db.users.update_one(
                    {"username": participant},
                    {"$inc": {"sol_balance": stake_amount}}
                )
            
            # Get user who ended the challenge
            ender_user = await self.db.users.find_one({"username": ended_by_user})
            
            # Send notifications to all other participants
            notification_results = []
            for participant in participants:
                if participant != ended_by_user:
                    result = await self._send_challenge_ended_notification(
                        challenge, participant, ender_user, reason
                    )
                    notification_results.append(result)
            
            return {
                "success": True,
                "challenge_id": challenge_id,
                "refunded_amount": stake_amount,
                "notifications_sent": len(notification_results),
                "results": notification_results
            }
            
        except Exception as e:
            logger.error(f"Error handling challenge end: {e}")
            return {"success": False, "error": str(e)}
    
    async def check_progress_and_notify(self, challenge_id: str) -> Dict[str, Any]:
        """Check challenge progress and send notifications when participants are near goals"""
        try:
            challenge = await self.db.challenges.find_one({"_id": challenge_id})
            if not challenge or challenge.get("status") != "active":
                return {"success": False, "error": "Challenge not active"}
            
            participants = challenge.get("participants", [])
            target = challenge.get("target", 0)
            challenge_type = challenge.get("type", "steps")
            
            notifications_sent = []
            
            # Check each participant's progress
            for participant in participants:
                # Get user's current progress (this would integrate with your health data)
                user_progress = await self._get_user_progress(participant, challenge_type)
                progress_percentage = (user_progress / target) * 100 if target > 0 else 0
                
                # Notify others if participant is close to goal (80%+ completion)
                if progress_percentage >= 80:
                    for other_participant in participants:
                        if other_participant != participant:
                            result = await self._send_progress_alert(
                                challenge, participant, other_participant, progress_percentage
                            )
                            notifications_sent.append(result)
            
            return {
                "success": True,
                "notifications_sent": len(notifications_sent),
                "results": notifications_sent
            }
            
        except Exception as e:
            logger.error(f"Error checking progress: {e}")
            return {"success": False, "error": str(e)}
    
    async def _send_challenge_started_notification(self, challenge: Dict, participant: str, starter_user: Dict) -> Dict[str, Any]:
        """Send notification when challenge starts"""
        try:
            participant_user = await self.db.users.find_one({"username": participant})
            if not participant_user or not participant_user.get("email"):
                return {"success": False, "error": "Participant email not found"}
            
            challenge_data = {
                "type": challenge.get("type", "challenge"),
                "target": challenge.get("target", 0),
                "duration": challenge.get("duration", 24),
                "stake": challenge.get("stake", 0),
                "id": str(challenge.get("_id", ""))
            }
            
            result = await self.email_client.send_challenge_started_email(
                recipient_email=participant_user["email"],
                recipient_name=participant_user.get("full_name", participant),
                challenge_data=challenge_data,
                starter_name=starter_user.get("full_name", starter_user.get("username", "Someone"))
            )
            
            return {"participant": participant, "result": result}
            
        except Exception as e:
            return {"participant": participant, "success": False, "error": str(e)}
    
    async def _send_challenge_ended_notification(self, challenge: Dict, participant: str, ender_user: Dict, reason: str) -> Dict[str, Any]:
        """Send notification when challenge ends early"""
        try:
            participant_user = await self.db.users.find_one({"username": participant})
            if not participant_user or not participant_user.get("email"):
                return {"success": False, "error": "Participant email not found"}
            
            challenge_data = {
                "type": challenge.get("type", "challenge"),
                "target": challenge.get("target", 0),
                "duration": challenge.get("duration", 24),
                "stake": challenge.get("stake", 0),
                "id": str(challenge.get("_id", "")),
                "reason": reason
            }
            
            result = await self.email_client.send_challenge_ended_email(
                recipient_email=participant_user["email"],
                recipient_name=participant_user.get("full_name", participant),
                challenge_data=challenge_data,
                ender_name=ender_user.get("full_name", ender_user.get("username", "Someone"))
            )
            
            return {"participant": participant, "result": result}
            
        except Exception as e:
            return {"participant": participant, "success": False, "error": str(e)}
    
    async def _send_progress_alert(self, challenge: Dict, leading_participant: str, notify_participant: str, progress_percentage: float) -> Dict[str, Any]:
        """Send alert when someone is close to winning"""
        try:
            notify_user = await self.db.users.find_one({"username": notify_participant})
            leading_user = await self.db.users.find_one({"username": leading_participant})
            
            if not notify_user or not notify_user.get("email"):
                return {"success": False, "error": "Participant email not found"}
            
            challenge_data = {
                "type": challenge.get("type", "challenge"),
                "target": challenge.get("target", 0),
                "duration": challenge.get("duration", 24),
                "stake": challenge.get("stake", 0),
                "id": str(challenge.get("_id", "")),
                "progress_percentage": progress_percentage
            }
            
            result = await self.email_client.send_progress_alert_email(
                recipient_email=notify_user["email"],
                recipient_name=notify_user.get("full_name", notify_participant),
                challenge_data=challenge_data,
                leading_participant_name=leading_user.get("full_name", leading_participant)
            )
            
            return {"notified": notify_participant, "leader": leading_participant, "result": result}
            
        except Exception as e:
            return {"notified": notify_participant, "success": False, "error": str(e)}
    
    async def _get_user_progress(self, username: str, challenge_type: str) -> float:
        """Get user's current progress for the challenge type"""
        try:
            # Get the most recent step data for the user
            user_steps = await self.db.user_steps.find_one(
                {"username": username},
                sort=[("timestamp", -1)]
            )
            
            if challenge_type == "steps":
                return user_steps.get("steps", 0) if user_steps else 0
            elif challenge_type == "active_minutes":
                return user_steps.get("active_minutes", 0) if user_steps else 0
            elif challenge_type == "calories":
                return user_steps.get("calories", 0) if user_steps else 0
            else:
                return 0
                
        except Exception as e:
            logger.error(f"Error getting user progress: {e}")
            return 0
