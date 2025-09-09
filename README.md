# Nx Cache Server

A **remote build cache server** for [Nx](https://nx.dev), built with **TypeScript**, **Express.js**, and an **LRU cache** for fast access.
It provides **API compatibility**, **performance optimizations**, and easy integration into both local and CI/CD environments.

---

## 🚀 Features

* Compatible with **Nx Remote Cache API**
* **LRU cache** for faster cache hits
* **API key authentication** (read/write tokens)
* Stores cache artifacts on the **filesystem**
* Easy integration with **Docker** & CI/CD

---

## 📦 Installation

```bash
git clone https://github.com/mavarazo/nx-cache.git
cd nx-cache
npm install
```

---

## ⚙️ Configuration

Configuration is handled via **dotenv** (`.env`):

```env
API_KEY_READ_TOKEN=secret-read-token
API_KEY_WRITE_TOKEN=secret-write-token
CACHE_DIR=/tmp/nx-cache
NODE_ENV=production
PORT=3000
```

* **API_KEY_READ_TOKEN** – Token for read access (optional)
* **API_KEY_WRITE_TOKEN** – Token for write access (required)
* **CACHE_DIR** – Cache folder (required, default: `os.tmpdir()`)
* **NODE_ENV** – Environment (required, `development` | `production`)
* **PORT** – Server port (required, default: `3000`)

---

## ▶️ Running

### Local

```bash
npm run build
npm start
```

### With Docker

```bash
docker build -t nx-cache .
docker run -d -p 3000:3000 \
  -e API_KEY_READ_TOKEN=secret-read-token \
  -e API_KEY_WRITE_TOKEN=secret-write-token \
  nx-cache
```

---

## 🔧 Nx Integration

Update your `nx.json` to enable remote cache support:

```json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "test", "lint", "e2e"],
        "remoteCache": {
          "url": "http://localhost:3000/v1/cache",
          "headers": {
            "Authorization": "Bearer secret-<read|write>-token"
          }
        }
      }
    }
  }
}
```

### Notes

* **cacheableOperations**: defines which tasks should be cached (e.g., `build`, `test`).
* **remoteCache.url**: URL of your cache server.
* **headers**: optional – for API key authentication.
  * GET requests: optional the **read token**.
  * PUT requests: require the **write token**.

CI/CD best practices:

* Provide the **read token** in all jobs.
* Restrict the **write token** to trusted branches (e.g., `main`, `release`).

---

## 📜 License

This project is licensed under the [Apache 2.0 License](https://github.com/mavarazo/nx-cache/blob/main/LICENSE).
