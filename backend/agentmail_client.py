import os
import json
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from agentmail import AgentMail
import httpx
from dotenv import load_dotenv

load_dotenv()

class AgentMailClient:
    def __init__(self):
        self.api_key = os.getenv("AGENTMAIL_API_KEY")
        self.inbox_id = os.getenv("AGENTMAIL_INBOX_ID")  # Pre-created inbox for the app
        self.client = AgentMail(api_key=self.api_key)
        self.asi_api_key = os.getenv("ASI_ONE_API_KEY")
        self.asi_base_url = "https://api.asi1.ai/v1"
        
    async def send_challenge_invitation(self, recipient_email: str, recipient_name: str, challenge_data: Dict[str, Any], sender_name: str) -> Dict[str, Any]:
        """Send a challenge invitation email via AgentMail with AI-generated content"""
        
        # Fetch SOL→USD price for display
        sol_usd = await self._fetch_sol_usd_price()
        if sol_usd:
            challenge_data = {**challenge_data, "sol_usd_price": sol_usd}
        
        # Generate personalized email content using ASI One
        ai_content = await self._generate_ai_email_content(
            recipient_name=recipient_name,
            sender_name=sender_name,
            challenge_data=challenge_data
        )
        
        subject = ai_content.get("subject", f"🏃‍♂️ {sender_name} has challenged you to a {challenge_data['type']} challenge!")
        email_body = ai_content.get("html_body", self._get_fallback_email_content(recipient_name, sender_name, challenge_data))
        text_body = ai_content.get("text_body", self._create_text_version(recipient_name, sender_name, challenge_data))
        
        try:
            # Send email using AgentMail SDK
            result = self.client.inboxes.messages.send(
                inbox_id=self.inbox_id,
                to=[recipient_email],
                subject=subject,
                html=email_body,
                text=text_body,
                labels=["challenge_invitation", "health_app"]
            )
            
            return {
                "success": True,
                "message_id": result.id if hasattr(result, 'id') else None,
                "status": "sent"
            }
                    
        except Exception as e:
            print(f"AgentMail send error: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    async def _generate_ai_email_content(self, recipient_name: str, sender_name: str, challenge_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized email content using ASI One agent"""
        try:
            session_id = str(uuid.uuid4())
            
            stake = challenge_data.get("stakeAmount", challenge_data.get("stake", 0.1))
            sol_usd = challenge_data.get('sol_usd_price')
            stake_usd_text = f" (≈ ${float(stake) * sol_usd:.2f})" if sol_usd else ""
            message = challenge_data.get("message", "")
            prompt = f"""
            Generate a personalized, engaging challenge invitation email for CoinStep, a health and fitness app.
            
            Context:
            - Sender: {sender_name}
            - Recipient: {recipient_name}
            - Challenge Type: {challenge_data.get('type', 'health')}
            - Target: {challenge_data.get('target', 'N/A')}
            - Duration: {challenge_data.get('duration', 24)} hours
            - Stake: {stake} SOL{stake_usd_text}
            - Personal Message: {challenge_data.get('message', 'Let\'s do this together!')}
            
            Generate a JSON response with:
            - subject: Catchy email subject line
            - html_body: Well-formatted HTML email body
            - text_body: Plain text version
            
            Make it motivational, friendly, and clear about the challenge details.
            Include a call-to-action to join the challenge.

            Return as JSON:
            {{
                "subject": "engaging subject line",
                "html_body": "complete HTML email with inline CSS",
                "text_body": "plain text version"
            }}
            """

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.asi_base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.asi_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "asi1-mini",
                        "messages": [
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": 0.7,
                        "max_tokens": 1000
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result["choices"][0]["message"]["content"]
                    
                    # Parse JSON response
                    try:
                        import json
                        ai_content = json.loads(content)
                        return ai_content
                    except json.JSONDecodeError:
                        import re
                        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', content, re.DOTALL)
                        if json_match:
                            try:
                                ai_content = json.loads(json_match.group(1))
                                return ai_content
                            except json.JSONDecodeError:
                                print(f"Failed to parse extracted JSON: {json_match.group(1)}")
                        else:
                            print(f"Failed to parse AI response as JSON: {content}")
                        return self._get_fallback_email_content(recipient_name, sender_name, challenge_data)
                else:
                    print(f"ASI One API error: {response.status_code} - {response.text}")
                    return self._get_fallback_email_content(recipient_name, sender_name, challenge_data)
                    
        except Exception as e:
            print(f"Error generating AI email content: {str(e)}")
            return self._get_fallback_email_content(recipient_name, sender_name, challenge_data)

    async def _fetch_sol_usd_price(self) -> Optional[float]:
        """Fetch current SOL→USD price from CoinGecko"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
                    timeout=10.0
                )
                if response.status_code == 200:
                    data = response.json()
                    return data.get("solana", {}).get("usd")
        except Exception as e:
            print(f"Failed to fetch SOL price: {e}")
        return None

    async def send_challenge_reminder(self, recipient_email: str, recipient_name: str, challenge_data: Dict[str, Any]) -> Dict[str, Any]:
        """Send a challenge reminder email"""
        
        subject = f" Reminder: Your {challenge_data['type']} challenge ends soon!"
        
        email_body = self._create_reminder_email_body(
            recipient_name=recipient_name,
            challenge_data=challenge_data
        )
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/messages",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "inbox_id": self.inbox_id,
                        "to": [{"email": recipient_email, "name": recipient_name}],
                        "subject": subject,
                        "html_body": email_body,
                        "tags": ["challenge_reminder", "health_app"],
                        "metadata": {
                            "challenge_id": challenge_data.get("id"),
                            "challenge_type": challenge_data["type"],
                            "reminder_type": "deadline"
                        }
                    },
                    timeout=30.0
                )
                
                return {"success": response.status_code in [200, 201]}
                    
        except Exception as e:
            print(f"AgentMail reminder error: {str(e)}")
            return {"success": False, "error": str(e)}

    def _get_fallback_email_content(self, recipient_name: str, sender_name: str, challenge_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create fallback HTML email body when AI generation fails"""
        
        challenge_type = challenge_data["type"].replace("_", " ").title()
        target = challenge_data["target"]
        duration = challenge_data["duration"]
        stake = challenge_data.get("stakeAmount", challenge_data.get("stake", 0.1))
        message = challenge_data.get("message", "")
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Challenge Invitation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🏃‍♂️ Challenge Invitation!</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">You've been challenged by {sender_name}</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
                <h2 style="color: #667eea; margin-top: 0;">Challenge Details</h2>
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
                    <p style="margin: 0 0 10px 0;"><strong>Type:</strong> {challenge_type}</p>
                    <p style="margin: 0 0 10px 0;"><strong>Target:</strong> {target} {challenge_data.get('unit', 'steps')}</p>
                    <p style="margin: 0 0 10px 0;"><strong>Duration:</strong> {duration} hours</p>
                    <p style="margin: 0;"><strong>Stake:</strong> {stake} SOL</p>
                </div>
            </div>
            
            {f'<div style="background: #e8f4fd; padding: 20px; border-radius: 10px; margin-bottom: 25px;"><h3 style="color: #1976d2; margin-top: 0;">Personal Message</h3><p style="font-style: italic; margin: 0;">"{message}"</p></div>' if message else ''}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://coinstep.app/challenge/{challenge_data.get('id', '')}" 
                   style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block;">
                    Accept Challenge 🚀
                </a>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p>Sent via CoinStep - Your Health Challenge App</p>
                <p>Ready to get moving? Accept the challenge and start your fitness journey!</p>
            </div>
        </body>
        </html>
        """
        
        text_body = self._create_text_version(recipient_name, sender_name, challenge_data)
        
        return {
            "subject": f"🏃‍♂️ {sender_name} has challenged you to a {challenge_type} challenge!",
            "html_body": html_body,
            "text_body": text_body
        }

    def _create_challenge_email_body(self, recipient_name: str, sender_name: str, challenge_data: Dict[str, Any]) -> str:
        """Create HTML email body for challenge invitation"""
        
        challenge_type = challenge_data["type"].replace("_", " ").title()
        target = challenge_data["target"]
        duration = challenge_data["duration"]
        stake = challenge_data.get("stakeAmount", challenge_data.get("stake", 0.1))
        message = challenge_data.get("message", "")
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Challenge Invitation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🏃‍♂️ Challenge Invitation!</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">You've been challenged by {sender_name}</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
                <h2 style="color: #667eea; margin-top: 0;">Challenge Details</h2>
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
                    <p style="margin: 0 0 10px 0;"><strong>Type:</strong> {challenge_type}</p>
                    <p style="margin: 0 0 10px 0;"><strong>Target:</strong> {target} {challenge_data.get('unit', 'steps')}</p>
                    <p style="margin: 0 0 10px 0;"><strong>Duration:</strong> {duration} hours</p>
                    <p style="margin: 0;"><strong>Stake:</strong> {stake} SOL</p>
                </div>
            </div>
            
            {f'<div style="background: #e8f4fd; padding: 20px; border-radius: 10px; margin-bottom: 25px;"><h3 style="color: #1976d2; margin-top: 0;">Personal Message</h3><p style="font-style: italic; margin: 0;">"{message}"</p></div>' if message else ''}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://coinstep.app/challenge/{challenge_data.get('id', '')}" 
                   style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block;">
                    Accept Challenge 🚀
                </a>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
                <p style="margin: 0; color: #856404;"><strong>How it works:</strong> Accept the challenge, track your progress, and compete with friends. Winner takes the pot!</p>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p>Sent via CoinStep - Your Health Challenge App</p>
                <p>Download the app to join the challenge and track your progress!</p>
            </div>
        </body>
        </html>
        """

    def _create_reminder_email_body(self, recipient_name: str, challenge_data: Dict[str, Any]) -> str:
        """Create HTML email body for challenge reminder"""
        
        challenge_type = challenge_data["type"].replace("_", " ").title()
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Challenge Reminder</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Challenge Reminder</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">Your challenge is ending soon!</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
                <h2 style="color: #ff9800; margin-top: 0;">Don't miss out!</h2>
                <p>Hi {recipient_name},</p>
                <p>Your <strong>{challenge_type}</strong> challenge is ending soon. Make sure to complete your goal and submit your final data!</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://coinstep.app/challenge/{challenge_data.get('id', '')}" 
                   style="background: #ff9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block;">
                    Check Progress 📊
                </a>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p>Sent via CoinStep - Your Health Challenge App</p>
            </div>
        </body>
        </html>
        """

    def _create_text_version(self, recipient_name: str, sender_name: str, challenge_data: Dict[str, Any]) -> str:
        """Create plain text version of the email"""
        
        challenge_type = challenge_data["type"].replace("_", " ").title()
        target = challenge_data["target"]
        duration = challenge_data["duration"]
        stake = challenge_data.get("stakeAmount", challenge_data.get("stake", 0.1))
        message = challenge_data.get("message", "")
        
        text = f"""
Challenge Invitation from {sender_name}!

Hi {recipient_name},

{sender_name} has challenged you to a {challenge_type} challenge!

Challenge Details:
- Type: {challenge_type}
- Target: {target} {challenge_data.get('unit', 'steps')}
- Duration: {duration} hours
- Stake: {stake} SOL{stake_usd_text}

{f'Personal Message: "{message}"' if message else ''}

Accept the challenge by opening the CoinStep app or visiting:
https://coinstep.app/challenge/{challenge_data.get('id', '')}

Good luck!

---
Sent via CoinStep - Your Health Challenge App
        """
        
        return text.strip()

    async def send_challenge_started_email(self, recipient_email: str, recipient_name: str, challenge_data: Dict[str, Any], starter_name: str) -> Dict[str, Any]:
        """Send notification when challenge starts"""
        subject = f"🚀 Challenge Started! {starter_name} has begun your {challenge_data['type']} challenge"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Challenge Started</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0;">🚀 Challenge Started!</h1>
                <p style="color: white; margin: 10px 0 0 0;">Time to get moving, {recipient_name}!</p>
            </div>
            
            <p>Great news! <strong>{starter_name}</strong> has started your {challenge_data['type']} challenge. The competition is now live!</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3>Challenge Details:</h3>
                <p><strong>Target:</strong> {challenge_data['target']} {challenge_data['type']}</p>
                <p><strong>Duration:</strong> {challenge_data['duration']} hours</p>
                <p><strong>Stake:</strong> {challenge_data['stake']} SOL</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://coinstep.app/challenge/{challenge_data.get('id', '')}" 
                   style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                    View Challenge
                </a>
            </div>
            
            <p style="text-align: center; color: #666;">Good luck and may the best challenger win! 💪</p>
        </body>
        </html>
        """
        
        try:
            result = self.client.inboxes.messages.send(
                inbox_id=self.inbox_id,
                to=[recipient_email],
                subject=subject,
                html=html_body,
                labels=["challenge_started", "health_app"]
            )
            
            return {
                "success": True,
                "message_id": getattr(result, 'id', None),
                "status": "sent"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def send_challenge_ended_email(self, recipient_email: str, recipient_name: str, challenge_data: Dict[str, Any], ender_name: str) -> Dict[str, Any]:
        """Send notification when challenge ends early"""
        subject = f"⏹️ Challenge Ended Early - {challenge_data['type']} challenge terminated"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Challenge Ended</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0;">⏹️ Challenge Ended</h1>
                <p style="color: white; margin: 10px 0 0 0;">Your challenge has been terminated early</p>
            </div>
            
            <p>Hi {recipient_name},</p>
            
            <p><strong>{ender_name}</strong> has ended your {challenge_data['type']} challenge early.</p>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h3>What happens now:</h3>
                <p>✅ Your stake of <strong>{challenge_data['stake']} SOL</strong> has been refunded</p>
                <p>✅ No winner will be declared</p>
                <p>✅ Challenge statistics have been saved</p>
            </div>
            
            <p><strong>Reason:</strong> {challenge_data.get('reason', 'Early termination requested')}</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://coinstep.app/challenges" 
                   style="background: #FF9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                    View All Challenges
                </a>
            </div>
            
            <p style="text-align: center; color: #666;">Ready for your next challenge? 🚀</p>
        </body>
        </html>
        """
        
        try:
            result = self.client.inboxes.messages.send(
                inbox_id=self.inbox_id,
                to=[recipient_email],
                subject=subject,
                html=html_body,
                labels=["challenge_ended", "health_app"]
            )
            
            return {
                "success": True,
                "message_id": getattr(result, 'id', None),
                "status": "sent"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def send_progress_alert_email(self, recipient_email: str, recipient_name: str, challenge_data: Dict[str, Any], leading_participant_name: str) -> Dict[str, Any]:
        """Send alert when opponent is close to winning"""
        subject = f"🔥 {leading_participant_name} is close to winning your {challenge_data['type']} challenge!"
        
        progress = challenge_data.get('progress_percentage', 80)
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Progress Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #FF5722 0%, #D84315 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0;">🔥 Alert!</h1>
                <p style="color: white; margin: 10px 0 0 0;">Your opponent is gaining ground!</p>
            </div>
            
            <p>Hi {recipient_name},</p>
            
            <p><strong>{leading_participant_name}</strong> is making great progress in your {challenge_data['type']} challenge!</p>
            
            <div style="background: #ffebee; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #f44336;">
                <h3>⚠️ Progress Update:</h3>
                <p><strong>{leading_participant_name}</strong> has completed <strong>{progress:.1f}%</strong> of the target!</p>
                <p>Target: {challenge_data['target']} {challenge_data['type']}</p>
                <p>Stake at risk: <strong>{challenge_data['stake']} SOL</strong></p>
            </div>
            
            <p>Time to step up your game! Don't let them win without a fight! 💪</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://coinstep.app/challenge/{challenge_data.get('id', '')}" 
                   style="background: #FF5722; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                    View Challenge Progress
                </a>
            </div>
            
            <p style="text-align: center; color: #666;">The race is on! 🏃‍♂️💨</p>
        </body>
        </html>
        """
        
        try:
            result = self.client.inboxes.messages.send(
                inbox_id=self.inbox_id,
                to=[recipient_email],
                subject=subject,
                html=html_body,
                labels=["progress_alert", "health_app"]
            )
            
            return {
                "success": True,
                "message_id": getattr(result, 'id', None),
                "status": "sent"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
