# Deployment Guide

This guide covers provisioning EC2 infrastructure and deploying ET Pulse using Terraform.

## Prerequisites

- **Terraform**: [Install v1.0+](https://www.terraform.io/downloads)
- **AWS CLI**: Configured with credentials (`aws configure`)
- **SSH Key Pair**: Generate locally: `ssh-keygen -t rsa -b 4096 -f ~/.ssh/et-pulse-key`

## Step 1: Prepare Terraform Variables

Create `infra/terraform.tfvars`:

```hcl
aws_region      = "ap-south-1"
instance_type   = "t3.micro"        # Free tier
app_name        = "et-pulse"
key_pair_name   = "et-pulse-key"
public_key_path = "~/.ssh/et-pulse-key.pub"

# SECURITY: Restrict SSH to your IP only
# Replace with your actual IP (e.g., 203.0.113.42/32)
# Find your IP: curl https://ifconfig.me
ssh_cidr        = "YOUR_IP/32"      # e.g., "203.0.113.42/32" or "0.0.0.0/0" (less secure)

github_token    = ""                # Optional: for private repos
```

**To find your IP:**
```bash
curl https://ifconfig.me
```

Then set `ssh_cidr = "YOUR_IP/32"` in terraform.tfvars.

## Step 2: Initialize Terraform

```bash
cd infra
terraform init
```

This downloads AWS provider and creates `.terraform/` directory (gitignored).

## Step 3: Plan Deployment

```bash
terraform plan
```

Review resources that will be created:
- EC2 instance (t3.micro)
- Security group (ports 22, 80, 3000, 443)
- Key pair for SSH access

## Step 4: Apply Configuration

```bash
terraform apply
```

Confirm by typing `yes`. Terraform will provision EC2 and output:
```
ec2_instance_id = "i-xxxxxxxxx"
ec2_public_ip   = "1.2.3.4"
ec2_public_dns  = "ec2-1-2-3-4.compute-1.amazonaws.com"
ssh_command     = "ssh -i ~/.ssh/et-pulse-key.pem ubuntu@1.2.3.4"
app_url         = "http://1.2.3.4:3000"
```

## Step 5: Connect to EC2

```bash
ssh -i ~/.ssh/et-pulse-key.pem ubuntu@<EC2_PUBLIC_IP>
```

## Step 6: Deploy ET Pulse

On EC2 instance:

```bash
# Clone repository
git clone https://github.com/madhav-09/-ET-Pulse-.git et-pulse
cd et-pulse

# Create .env.local with API keys
cat > .env.local << EOF
GEMINI_API_KEY=your_key
NEWS_API_KEY=your_key
EOF

# Start services
docker-compose up -d
docker-compose ps

# View logs
docker-compose logs -f
```

## Step 7: Access Application

Open browser: `http://<EC2_PUBLIC_IP>:3000`

Or use the `app_url` output from Terraform.

## Monitoring

Check service health:
```bash
curl http://localhost:3000            # Web Gateway
curl http://localhost:4001/health     # Intelligence API
curl http://localhost:4002/health     # News API
```

## Cleanup

**Destroy all resources** (stops billing):

```bash
cd infra
terraform destroy
```

Confirm by typing `yes`.

## Troubleshooting

**"Permission denied (publickey)":**
- Ensure key pair name in `terraform.tfvars` matches your local key: `~/.ssh/et-pulse-key.pem`
- Check permissions: `chmod 600 ~/.ssh/et-pulse-key.pem`

**"ec2-user not found":**
- Ubuntu AMI uses `ubuntu` user, not `ec2-user`

**Docker/docker-compose not found on EC2:**
- Wait 2-3 minutes for user data script to complete
- Check logs: `tail -20 /var/log/cloud-init-output.log`

**Services not running:**
- SSH into instance and check: `docker-compose logs`
- Verify `.env.local` has valid API keys

## Cost Estimation

- **EC2 t3.micro**: Free tier (750 hours/month)
- **Data transfer**: Free within region (ap-south-1)
- **Total monthly cost**: ~₹200 (if free tier exceeded)

See [AWS Free Tier](https://aws.amazon.com/free/) for details.
