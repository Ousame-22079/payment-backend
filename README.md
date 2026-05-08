# 💳 Payment Platform — Backend API

Backend Next.js pour une plateforme de paiement numérique (PME).

## Stack
- **Next.js 14** (App Router + API Routes)
- **Prisma** (ORM)
- **PostgreSQL**
- **JWT** (authentification)
- **Zod** (validation)

## Prérequis
- Node.js 18+
- PostgreSQL installé et en cours d'exécution

## Installation

### 1. Cloner / extraire le projet
```bash
cd payment-backend
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer l'environnement
```bash
cp .env.example .env
```
Editez `.env` et renseignez :
```
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/payment_db"
JWT_SECRET="changez_cette_valeur_secrete"
```

### 4. Créer la base de données PostgreSQL
```sql
CREATE DATABASE payment_db;
```

### 5. Appliquer les migrations
```bash
npm run db:migrate
npm run db:generate
```

### 6. Lancer le serveur
```bash
npm run dev
```

L'API est disponible sur **http://localhost:3000**

---

## Endpoints

### Auth
| Méthode | URL | Description |
|--------|-----|-------------|
| POST | /api/auth/register | Créer un compte |
| POST | /api/auth/login | Se connecter |
| GET | /api/auth/me | Profil courant |

### Utilisateurs
| Méthode | URL | Description |
|--------|-----|-------------|
| GET | /api/users | Liste (Admin) |
| GET | /api/users/:id | Détail |
| PUT | /api/users/:id | Modifier |
| DELETE | /api/users/:id | Supprimer (Admin) |

### Transactions
| Méthode | URL | Description |
|--------|-----|-------------|
| GET | /api/transactions | Historique |
| POST | /api/transactions | Créer un paiement |
| GET | /api/transactions/:id | Détail |
| PATCH | /api/transactions/:id | Changer statut (Admin) |

### Dashboard
| Méthode | URL | Description |
|--------|-----|-------------|
| GET | /api/dashboard | Statistiques |

---

## Exemple d'utilisation

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@test.com","password":"secret123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"secret123"}'
```

### Créer une transaction (avec token)
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"receiverId":"UUID_DU_DESTINATAIRE","amount":50,"description":"Paiement facture"}'
```
