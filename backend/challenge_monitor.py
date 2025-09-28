import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any
import logging
from motor.motor_asyncio import AsyncIOMotorDatabase
from agentmail_client import AgentMailClient

logger = logging.getLogger(__name__)

class ChallengeMonitor:
    def __init__(self, db: AsyncIOMotorDatabase, agentmail_client: AgentMailClient):
        self.db = db
        self.agentmail_client = agentmail_client
        self.monitoring = False

    async def start_monitoring(self):
        """Start the challenge monitoring system"""
        self.monitoring = True
        logger.info("Challenge monitoring system started")
        
        while self.monitoring:
            try:
                await self.check_active_challenges()
                await asyncio.sleep(300)  # Check every 5 minutes
            except Exception as e:
                logger.error(f"Error in challenge monitoring: {e}")
                await asyncio.sleep(60)  # Wait 1 minute before retrying

    async def stop_monitoring(self):
        """Stop the challenge monitoring system"""
        self.monitoring = False
        logger.info("Challenge monitoring system stopped")

    async def check_active_challenges(self):
        """Check all active challenges for completion and determine winners"""
        active_challenges = await self.db.challenges.find({
            "status": "active",
            "ends_at": {"$lte": datetime.utcnow().isoformat()}
        }).to_list(length=None)

        for challenge in active_challenges:
            await self.process_completed_challenge(challenge)

    async def process_completed_challenge(self, challenge: Dict[str, Any]):
        """Process a completed challenge and determine the winner"""
        try:
            challenge_id = str(challenge["_id"])
            participants = challenge["participants"]
            metrics = challenge["metrics"]
            
            # Get health data for all participants during challenge period
            participant_scores = {}
            
            for participant_email in participants:
                # Get user by email
                user = await self.db.users.find_one({"email": participant_email})
                if not user:
                    continue
                    
                username = user["username"]
                score = await self.calculate_participant_score(
                    username, 
                    metrics, 
                    challenge["starts_at"], 
                    challenge["ends_at"]
                )
                participant_scores[participant_email] = {
                    "username": username,
                    "score": score,
                    "email": participant_email
                }

            # Determine winner (highest score)
            if participant_scores:
                winner_email = max(participant_scores.keys(), 
                                 key=lambda x: participant_scores[x]["score"])
                winner_data = participant_scores[winner_email]
                
                # Update challenge with results
                await self.db.challenges.update_one(
                    {"_id": challenge["_id"]},
                    {
                        "$set": {
                            "status": "completed",
                            "winner": winner_email,
                            "final_scores": participant_scores,
                            "completed_at": datetime.utcnow().isoformat()
                        }
                    }
                )
                
                # Send notifications to all participants
                await self.send_challenge_completion_notifications(
                    challenge, winner_data, participant_scores
                )
                
                logger.info(f"Challenge {challenge_id} completed. Winner: {winner_email}")
            
        except Exception as e:
            logger.error(f"Error processing challenge {challenge.get('_id')}: {e}")

    async def calculate_participant_score(self, username: str, metrics: List[str], 
                                        start_date: str, end_date: str) -> float:
        """Calculate participant's score based on selected metrics"""
        total_score = 0.0
        
        # Get health data for the challenge period
        health_data = await self.db.health_metrics.find({
            "user_id": username,
            "date": {
                "$gte": start_date.split("T")[0],
                "$lte": end_date.split("T")[0]
            }
        }).to_list(length=None)
        
        if not health_data:
            return 0.0
        
        # Calculate scores for each metric
        for metric in metrics:
            metric_score = 0.0
            
            if metric == "steps":
                metric_score = sum(data.get("steps", 0) for data in health_data)
            elif metric == "active_minutes":
                metric_score = sum(data.get("active_minutes", 0) for data in health_data)
            elif metric == "calories":
                metric_score = sum(data.get("calories", 0) for data in health_data)
            elif metric == "distance":
                metric_score = sum(data.get("distance", 0) for data in health_data)
            elif metric == "heart_rate":
                heart_rates = [data.get("avg_heart_rate", 0) for data in health_data if data.get("avg_heart_rate", 0) > 0]
                metric_score = sum(heart_rates) / len(heart_rates) if heart_rates else 0
            elif metric == "sleep":
                metric_score = sum(data.get("sleep_hours", 0) for data in health_data)
            
            # Normalize scores (different metrics have different scales)
            normalized_score = self.normalize_metric_score(metric, metric_score)
            total_score += normalized_score
        
        return total_score

    def normalize_metric_score(self, metric: str, score: float) -> float:
        """Normalize metric scores to comparable ranges"""
        normalization_factors = {
            "steps": 0.0001,  # 10,000 steps = 1.0 point
            "active_minutes": 0.033,  # 30 minutes = 1.0 point
            "calories": 0.002,  # 500 calories = 1.0 point
            "distance": 0.2,  # 5 km = 1.0 point
            "heart_rate": 0.008,  # 120 bpm = 1.0 point
            "sleep": 0.125,  # 8 hours = 1.0 point
        }
        
        return score * normalization_factors.get(metric, 1.0)

    async def send_challenge_completion_notifications(self, challenge: Dict[str, Any], 
                                                    winner_data: Dict[str, Any], 
                                                    all_scores: Dict[str, Dict[str, Any]]):
        """Send email notifications to all participants about challenge completion"""
        try:
            challenge_name = f"Health Challenge ({', '.join(challenge['metrics'])})"
            
            # Send winner notification
            await self.send_winner_notification(winner_data, challenge_name, challenge)
            
            # Send participant notifications
            for email, participant_data in all_scores.items():
                if email != winner_data["email"]:
                    await self.send_participant_notification(
                        participant_data, winner_data, challenge_name, challenge
                    )
                    
        except Exception as e:
            logger.error(f"Error sending notifications: {e}")

    async def send_winner_notification(self, winner_data: Dict[str, Any], 
                                     challenge_name: str, challenge: Dict[str, Any]):
        """Send congratulations email to the winner"""
        try:
            subject = f"🏆 Congratulations! You won the {challenge_name}!"
            
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #6366F1, #8B5CF6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🏆 Victory!</h1>
                    <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">You crushed the competition!</p>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; margin-top: 0;">Congratulations {winner_data['username']}!</h2>
                    
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                        You've won the <strong>{challenge_name}</strong> with an outstanding score of 
                        <strong>{winner_data['score']:.2f} points</strong>!
                    </p>
                    
                    <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Challenge Details:</h3>
                        <ul style="color: #666; margin: 0; padding-left: 20px;">
                            <li>Metrics: {', '.join(challenge['metrics'])}</li>
                            <li>Duration: {challenge.get('duration', 24)} hours</li>
                            <li>Participants: {len(challenge['participants'])}</li>
                        </ul>
                    </div>
                    
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                        Your dedication to health and fitness has paid off! Keep up the amazing work and 
                        continue challenging yourself and your friends.
                    </p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #999; font-size: 14px;">
                            Keep moving, keep improving! 💪
                        </p>
                    </div>
                </div>
            </div>
            """
            
            await self.agentmail_client.send_email(
                to_email=winner_data["email"],
                subject=subject,
                html_content=html_content
            )
            
        except Exception as e:
            logger.error(f"Error sending winner notification: {e}")

    async def send_participant_notification(self, participant_data: Dict[str, Any], 
                                          winner_data: Dict[str, Any], 
                                          challenge_name: str, challenge: Dict[str, Any]):
        """Send challenge completion email to participants"""
        try:
            subject = f"Challenge Complete: {challenge_name} Results"
            
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #6366F1, #8B5CF6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">Challenge Complete!</h1>
                    <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">{challenge_name}</p>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; margin-top: 0;">Great effort, {participant_data['username']}!</h2>
                    
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                        The <strong>{challenge_name}</strong> has concluded. Here are the final results:
                    </p>
                    
                    <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">🏆 Winner: {winner_data['username']}</h3>
                        <p style="color: #666; margin: 5px 0;">Score: {winner_data['score']:.2f} points</p>
                        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 15px 0;">
                        <h4 style="color: #333; margin: 10px 0 5px 0;">Your Performance:</h4>
                        <p style="color: #666; margin: 0;">Score: {participant_data['score']:.2f} points</p>
                    </div>
                    
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                        Every step counts! You participated in a great challenge and pushed yourself to be more active. 
                        Ready for the next challenge?
                    </p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #999; font-size: 14px;">
                            Keep challenging yourself! 🚀
                        </p>
                    </div>
                </div>
            </div>
            """
            
            await self.agentmail_client.send_email(
                to_email=participant_data["email"],
                subject=subject,
                html_content=html_content
            )
            
        except Exception as e:
            logger.error(f"Error sending participant notification: {e}")

    async def mark_daily_completion(self, username: str, challenge_id: str, metrics: List[str]):
        """Mark daily completion for a user in a challenge"""
        try:
            today = datetime.utcnow().date().isoformat()
            
            # Record daily completion
            await self.db.daily_completions.update_one(
                {
                    "user_id": username,
                    "challenge_id": challenge_id,
                    "date": today
                },
                {
                    "$set": {
                        "completed_metrics": metrics,
                        "completed_at": datetime.utcnow().isoformat(),
                        "status": "completed"
                    }
                },
                upsert=True
            )
            
            logger.info(f"Daily completion marked for {username} in challenge {challenge_id}")
            
        except Exception as e:
            logger.error(f"Error marking daily completion: {e}")
