-- Create partial unique index to enforce at most one active referral per referee email at the database level
CREATE UNIQUE INDEX IF NOT EXISTS "idx_referral_active_referee" 
ON "referrals" (LOWER("refereeEmail")) 
WHERE status IN ('PENDING', 'DELIVERED');
