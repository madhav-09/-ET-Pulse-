variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.small"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "et-pulse"
}

variable "key_pair_name" {
  description = "EC2 Key Pair name"
  type        = string
  default     = "et-pulse-key"
}

variable "public_key_path" {
  description = "Path to public SSH key (~/.ssh/id_rsa.pub)"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "ssh_cidr" {
  description = "CIDR for SSH access (restrict to your IP for security)"
  type        = string
  default     = "0.0.0.0/0"
  # Example: "203.0.113.42/32" (your IP)
}

variable "github_token" {
  description = "GitHub personal access token (for docker login, optional)"
  type        = string
  default     = ""
  sensitive   = true
}
