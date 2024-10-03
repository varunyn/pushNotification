## How to Install

### Prerequisites

- Node.js installed on your machine

### Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/varunyn/pushNotification.git
   ```

2. Navigate to the project directory:

   ```bash
   cd pushNotification/server
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Generating VAPID Keys
   If you don't have VAPID keys, run this command from your terminal:

   ```bash
   npx web-push generate-vapid-keys --json
   ```

5. Copy the output and paste it into your .env file

6. Open firewall port in Compute VM

   ```bash
   sudo firewall-cmd --zone=public --add-port=4000/tcp --permanent
   sudo firewall-cmd --reload
   ```

7. Start the application:

   ```bash
   node app.js
   ```

Alternate method to run app using pm2

Install pm2

```bash
sudo npm install -g pm2
```

Add path

```bash
echo 'export PATH=$PATH:/usr/local/bin' >> ~/.bashrc
source ~/.bashrc
```

run command

```bash
pm2 start app.js
```
