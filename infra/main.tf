terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  private_key_path = "${path.module}/keys/${var.key_pair_name}.pem"
}

# EC2 Instance (t3.micro - free tier eligible)
resource "aws_instance" "et_pulse" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.deployer.key_name
  vpc_security_group_ids = [aws_security_group.et_pulse.id]

  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    delete_on_termination = true
  }

  tags = {
    Name = "${var.app_name}-instance"
  }

  # User data script to install Docker
  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    github_token = var.github_token
  }))
}

# Security Group
resource "aws_security_group" "et_pulse" {
  name        = "${var.app_name}-sg"
  description = "Security group for ET Pulse application"

  # SSH (port 22) - RESTRICTED to specific IP for security
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_cidr]
  }

  # HTTP (port 80)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Web Gateway (port 3000)
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS (port 443)
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound - allow all
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-sg"
  }
}

# Key Pair for SSH access
resource "tls_private_key" "deployer" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "local_sensitive_file" "private_key" {
  filename        = local.private_key_path
  content         = tls_private_key.deployer.private_key_pem
  file_permission = "0400"
}

resource "aws_key_pair" "deployer" {
  key_name   = var.key_pair_name
  public_key = tls_private_key.deployer.public_key_openssh

  tags = {
    Name = "${var.app_name}-key"
  }

  lifecycle {
    ignore_changes = [public_key]
  }
}

# Data source for latest Ubuntu 22.04 LTS AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}
