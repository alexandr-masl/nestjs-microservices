# Nginx Load Balancer Configuration for NestJS

## Overview

This repository contains a basic Nginx configuration file designed to implement a load balancer for a NestJS application. The configuration distributes incoming HTTP requests across multiple instances of the NestJS application, providing better performance and reliability.

## Configuration Details

The provided Nginx configuration file is set up to:

- **Load Balance Requests**: Distribute incoming requests across multiple NestJS application instances running on different ports.
- **Handle Errors**: Provide a custom error page for server errors (HTTP 500, 502, 503, 504).
- **Forward Headers**: Pass relevant headers to the upstream servers to maintain information about the original client.

### Nginx Configuration (`nginx.conf`)

```nginx
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    upstream nestjs_backend {
        server 127.0.0.1:3000;
        server 127.0.0.1:3001;
        server 127.0.0.1:3002;
    }

    server {
        listen       8080;
        server_name  localhost;

        location / {
            proxy_pass http://nestjs_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
            root /usr/local/var/www;
        }
    }

    include servers/*;
}
```

### Key Sections:

- **Upstream Block (`upstream nestjs_backend { ... }`)**:
  - Defines the backend servers that will handle requests.
  - Each `server` directive specifies a backend server. In this example, three instances are running on ports 3000, 3001, and 3002.

- **Server Block (`server { ... }`)**:
  - Listens on port 8080 and forwards requests to the upstream servers defined in the `upstream` block.
  - The `proxy_pass` directive forwards the request to the load-balanced backend servers.

## Usage Instructions

1. **Install Nginx**: Ensure that Nginx is installed on your system. If not, you can install it using your package manager or through Homebrew on macOS:
   ```bash
   brew install nginx
   ```

2. **Configure Nginx**: Copy the provided configuration file (`nginx.conf`) to your Nginx configuration directory (usually `/usr/local/etc/nginx/` on macOS).

3. **Start Nginx**: Start Nginx with the following command:
   ```bash
   brew services start nginx
   ```

4. **Access the Application**: Navigate to `http://localhost:8080` in your browser. Nginx will distribute requests across the backend servers running on ports 3000, 3001, and 3002.

5. **Monitoring and Logs**: Check the Nginx access and error logs for any issues:
   ```bash
   tail -f /usr/local/var/log/nginx/access.log
   tail -f /usr/local/var/log/nginx/error.log
   ```

## Additional Notes

- **Customization**: You can modify the upstream servers and other settings in the `nginx.conf` file to suit your specific requirements.
- **Scaling**: For larger applications, consider using additional Nginx features like health checks, sticky sessions, and more advanced load-balancing algorithms.