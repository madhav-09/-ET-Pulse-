output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.et_pulse.id
}

output "ec2_public_ip" {
  description = "EC2 public IP address"
  value       = aws_instance.et_pulse.public_ip
}

output "ec2_public_dns" {
  description = "EC2 public DNS name"
  value       = aws_instance.et_pulse.public_dns
}

output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.et_pulse.id
}

output "ssh_command" {
  description = "SSH command to connect to instance"
  value       = "ssh -i ${path.module}/keys/${var.key_pair_name}.pem ubuntu@${aws_instance.et_pulse.public_ip}"
}

output "app_url" {
  description = "Application URL - ET Pulse Web Gateway"
  value       = "http://${aws_instance.et_pulse.public_ip}:3000"
  sensitive   = false
}

output "instance_summary" {
  description = "Quick reference for instance access"
  value       = <<-EOT
    
    ✓ ET Pulse Infrastructure Deployed
    
    Application URL:  http://${aws_instance.et_pulse.public_ip}:3000
    Instance ID:      ${aws_instance.et_pulse.id}
    Public IP:        ${aws_instance.et_pulse.public_ip}
    SSH Access:       ssh -i ${path.module}/keys/${var.key_pair_name}.pem ubuntu@${aws_instance.et_pulse.public_ip}
    
    Next steps:
    1. Wait 2-3 minutes for Docker installation
    2. SSH into instance: ssh -i ~/.ssh/${var.key_pair_name}.pem ubuntu@${aws_instance.et_pulse.public_ip}
    3. Clone & deploy: git clone https://github.com/madhav-09/-ET-Pulse-.git && cd et-pulse
    4. Create .env.local with API keys
    5. Run: docker-compose up -d
    
    To destroy: terraform destroy
    
  EOT
}
