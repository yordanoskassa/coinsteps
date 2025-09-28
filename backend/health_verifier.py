import asyncio
import json
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import hashlib
import hmac
from dataclasses import dataclass
from solders.keypair import Keypair
from anchor_client import StepBettingClient

@dataclass
class HealthDataSubmission:
    username: str
    challenge_address: str
    steps_count: int
    date: str
    source: str  # "apple_health", "google_fit", "manual"
    raw_data: Dict[str, Any]
    device_info: Dict[str, Any]
    timestamp: datetime

@dataclass
class VerificationResult:
    is_valid: bool
    verified_steps: int
    confidence_score: float
    verification_method: str
    errors: List[str]

class HealthDataVerifier:
    """
    Off-chain health data verification service
    Validates step data from various sources before declaring winners on-chain
    """
    
    def __init__(self, oracle_keypair: Keypair):
        self.oracle_keypair = oracle_keypair
        self.betting_client = StepBettingClient()
        self.pending_verifications = {}
        
    async def submit_health_data(
        self, 
        submission: HealthDataSubmission
    ) -> Dict[str, Any]:
        """
        Accept health data submission for verification
        """
        # Store for verification processing
        verification_id = self._generate_verification_id(submission)
        self.pending_verifications[verification_id] = submission
        
        # Start async verification process
        asyncio.create_task(self._process_verification(verification_id))
        
        return {
            "verification_id": verification_id,
            "status": "pending",
            "estimated_completion": datetime.utcnow() + timedelta(minutes=5)
        }
    
    async def _process_verification(self, verification_id: str):
        """
        Process health data verification asynchronously
        """
        submission = self.pending_verifications[verification_id]
        
        try:
            # Multi-layer verification
            verification_result = await self._verify_health_data(submission)
            
            if verification_result.is_valid:
                # Check if this submission wins the challenge
                await self._check_and_declare_winner(submission, verification_result)
            
            # Update verification status
            self.pending_verifications[verification_id] = {
                **submission.__dict__,
                "verification_result": verification_result,
                "status": "completed"
            }
            
        except Exception as e:
            self.pending_verifications[verification_id] = {
                **submission.__dict__,
                "status": "failed",
                "error": str(e)
            }
    
    async def _verify_health_data(
        self, 
        submission: HealthDataSubmission
    ) -> VerificationResult:
        """
        Multi-layer health data verification
        """
        errors = []
        confidence_score = 0.0
        verification_methods = []
        
        # 1. Source-specific verification
        if submission.source == "apple_health":
            source_result = await self._verify_apple_health(submission)
            confidence_score += source_result["confidence"] * 0.4
            verification_methods.append("apple_health_validation")
            if source_result["errors"]:
                errors.extend(source_result["errors"])
                
        elif submission.source == "google_fit":
            source_result = await self._verify_google_fit(submission)
            confidence_score += source_result["confidence"] * 0.4
            verification_methods.append("google_fit_validation")
            if source_result["errors"]:
                errors.extend(source_result["errors"])
        
        # 2. Device integrity check
        device_result = await self._verify_device_integrity(submission)
        confidence_score += device_result["confidence"] * 0.3
        verification_methods.append("device_integrity")
        if device_result["errors"]:
            errors.extend(device_result["errors"])
        
        # 3. Behavioral pattern analysis
        pattern_result = await self._analyze_step_patterns(submission)
        confidence_score += pattern_result["confidence"] * 0.2
        verification_methods.append("pattern_analysis")
        if pattern_result["errors"]:
            errors.extend(pattern_result["errors"])
        
        # 4. Cross-reference with historical data
        history_result = await self._verify_against_history(submission)
        confidence_score += history_result["confidence"] * 0.1
        verification_methods.append("historical_validation")
        if history_result["errors"]:
            errors.extend(history_result["errors"])
        
        # Determine if verification passes
        is_valid = confidence_score >= 0.7 and len(errors) == 0
        verified_steps = submission.steps_count if is_valid else 0
        
        return VerificationResult(
            is_valid=is_valid,
            verified_steps=verified_steps,
            confidence_score=confidence_score,
            verification_method="+".join(verification_methods),
            errors=errors
        )
    
    async def _verify_apple_health(self, submission: HealthDataSubmission) -> Dict[str, Any]:
        """Verify Apple HealthKit data integrity"""
        confidence = 0.0
        errors = []
        
        raw_data = submission.raw_data
        
        # Check for required HealthKit fields
        required_fields = ["sourceRevision", "device", "startDate", "endDate", "value"]
        for field in required_fields:
            if field not in raw_data:
                errors.append(f"Missing required HealthKit field: {field}")
            else:
                confidence += 0.2
        
        # Validate device information
        if "device" in raw_data:
            device = raw_data["device"]
            if isinstance(device, dict) and "name" in device:
                # Known Apple devices get higher confidence
                apple_devices = ["iPhone", "Apple Watch"]
                if any(d in device["name"] for d in apple_devices):
                    confidence += 0.3
                else:
                    confidence += 0.1
        
        # Validate time range
        if "startDate" in raw_data and "endDate" in raw_data:
            try:
                start = datetime.fromisoformat(raw_data["startDate"].replace("Z", "+00:00"))
                end = datetime.fromisoformat(raw_data["endDate"].replace("Z", "+00:00"))
                duration = (end - start).total_seconds() / 3600  # hours
                
                # Reasonable duration (1-24 hours)
                if 1 <= duration <= 24:
                    confidence += 0.3
                else:
                    errors.append(f"Unusual duration: {duration} hours")
            except:
                errors.append("Invalid date format")
        
        return {"confidence": min(confidence, 1.0), "errors": errors}
    
    async def _verify_google_fit(self, submission: HealthDataSubmission) -> Dict[str, Any]:
        """Verify Google Fit data integrity"""
        confidence = 0.0
        errors = []
        
        # Similar verification logic for Google Fit
        # Implementation would check Google Fit specific fields
        
        return {"confidence": 0.8, "errors": errors}  # Placeholder
    
    async def _verify_device_integrity(self, submission: HealthDataSubmission) -> Dict[str, Any]:
        """Verify device hasn't been tampered with"""
        confidence = 0.0
        errors = []
        
        device_info = submission.device_info
        
        # Check for jailbreak/root indicators
        suspicious_indicators = [
            "jailbroken", "rooted", "emulator", "simulator"
        ]
        
        device_name = device_info.get("name", "").lower()
        if any(indicator in device_name for indicator in suspicious_indicators):
            errors.append("Suspicious device detected")
            confidence = 0.0
        else:
            confidence = 0.9
        
        # Check device consistency
        if "model" in device_info and "os" in device_info:
            confidence += 0.1
        
        return {"confidence": min(confidence, 1.0), "errors": errors}
    
    async def _analyze_step_patterns(self, submission: HealthDataSubmission) -> Dict[str, Any]:
        """Analyze step patterns for anomalies"""
        confidence = 0.8  # Default high confidence
        errors = []
        
        steps = submission.steps_count
        
        # Detect obviously fake numbers
        if steps > 100000:  # Unrealistic daily steps
            errors.append("Unrealistic step count")
            confidence = 0.0
        elif steps > 50000:  # Very high but possible
            confidence = 0.6
        elif steps < 100:  # Very low
            confidence = 0.7
        
        # Check for round numbers (often fake)
        if steps % 1000 == 0 and steps > 10000:
            confidence -= 0.2
            errors.append("Suspiciously round number")
        
        return {"confidence": max(confidence, 0.0), "errors": errors}
    
    async def _verify_against_history(self, submission: HealthDataSubmission) -> Dict[str, Any]:
        """Verify against user's historical step data"""
        confidence = 0.8
        errors = []
        
        # TODO: Implement historical data comparison
        # - Check against user's average daily steps
        # - Look for sudden spikes that might indicate cheating
        # - Verify consistency with past submissions
        
        return {"confidence": confidence, "errors": errors}
    
    async def _check_and_declare_winner(
        self, 
        submission: HealthDataSubmission, 
        verification: VerificationResult
    ):
        """
        Check if verified submission wins the challenge and declare winner on-chain
        """
        if not verification.is_valid:
            return
        
        # Get challenge data to check target steps
        challenge_data = await self.betting_client.get_challenge_data(
            submission.challenge_address
        )
        
        if not challenge_data["success"]:
            return
        
        # Check if steps meet target
        if verification.verified_steps >= challenge_data.get("target_steps", 0):
            # Declare winner on blockchain
            result = await self.betting_client.declare_winner(
                self.oracle_keypair,
                submission.challenge_address,
                submission.username,  # Convert to pubkey in actual implementation
                verification.verified_steps
            )
            
            if result["success"]:
                print(f"Winner declared on-chain: {submission.username} with {verification.verified_steps} steps")
    
    def _generate_verification_id(self, submission: HealthDataSubmission) -> str:
        """Generate unique verification ID"""
        data = f"{submission.username}{submission.challenge_address}{submission.timestamp}"
        return hashlib.sha256(data.encode()).hexdigest()[:16]
    
    async def get_verification_status(self, verification_id: str) -> Dict[str, Any]:
        """Get status of a verification request"""
        if verification_id not in self.pending_verifications:
            return {"error": "Verification not found"}
        
        return self.pending_verifications[verification_id]
    
    async def close(self):
        """Clean up resources"""
        await self.betting_client.close()
