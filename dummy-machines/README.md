# Dummy Linux Machines for Testing

This directory contains dummy Linux machines that simulate real servers for testing your monitoring UI.

## Available Machines

### 1. Web Server 1 (Ubuntu 22.04)
- **SSH Port**: 2221
- **HTTP Port**: 8081
- **Services**: Apache2, SSH
- **Access**: 
  - SSH: `ssh root@localhost -p 2221` (password: password123)
  - HTTP: http://localhost:8081

### 2. Database Server 1 (CentOS 7)
- **SSH Port**: 2222
- **MySQL Port**: 3306
- **Services**: MySQL, SSH
- **Access**:
  - SSH: `ssh root@localhost -p 2222` (password: password123)
  - MySQL: `mysql -h localhost -P 3306 -u root`

### 3. Application Server 1 (Debian 11)
- **SSH Port**: 2223
- **Node.js Port**: 3000
- **Services**: Node.js, SSH
- **Access**:
  - SSH: `ssh root@localhost -p 2223` (password: password123)
  - App: http://localhost:3000

### 4. Load Balancer 1 (Alpine Linux)
- **SSH Port**: 2224
- **Nginx Port**: 8082
- **Services**: Nginx, SSH
- **Access**:
  - SSH: `ssh root@localhost -p 2224` (password: password123)
  - Nginx: http://localhost:8082

### 5. Monitoring Server 1 (Ubuntu 20.04)
- **SSH Port**: 2225
- **Flask Port**: 9090
- **Services**: Flask app, SSH
- **Access**:
  - SSH: `ssh root@localhost -p 2225` (password: password123)
  - Flask: http://localhost:9090

## Network Information

All machines are connected to the `watchtower_net` Docker network and can communicate with each other using their hostnames:

- `web-server-1`
- `db-server-1`
- `app-server-1`
- `lb-server-1`
- `monitoring-server-1`

## Testing Commands

### Ping between machines
```bash
# From your host machine
ping localhost  # All machines are accessible via localhost on different ports

# From inside a machine (SSH into one first)
ping web-server-1
ping db-server-1
ping app-server-1
```

### SSH Access
```bash
# Connect to any machine
ssh root@localhost -p 2221  # Web server
ssh root@localhost -p 2222  # Database server
ssh root@localhost -p 2223  # App server
ssh root@localhost -p 2224  # Load balancer
ssh root@localhost -p 2225  # Monitoring server
```

### HTTP Access
```bash
# Test web services
curl http://localhost:8081  # Web server
curl http://localhost:3000  # App server
curl http://localhost:8082  # Load balancer
curl http://localhost:9090  # Monitoring server
```

## Monitoring Data

Each machine includes monitoring tools:
- `htop` - Process monitoring
- `iotop` - I/O monitoring
- `netstat` - Network statistics
- `ping` - Network connectivity testing
- `curl` - HTTP requests

## Adding to Your Monitoring System

You can add these machines to your monitoring system using their hostnames or IP addresses. Each machine will have its own IP within the Docker network that you can discover using:

```bash
docker network inspect watchtower_net
```

## Troubleshooting

If machines don't start properly:
1. Check Docker logs: `docker compose logs [machine-name]`
2. Ensure ports aren't already in use
3. Restart the specific service: `docker compose restart [machine-name]` 
