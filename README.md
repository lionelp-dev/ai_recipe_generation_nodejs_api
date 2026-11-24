# API REST de génération de recettes et de leur visuels avec de l'intelligence artificielle

## Prérequis

- Node.js 24.20 ou supérieur
- pnpm 10.28.1
- Une clé API OpenRouter pour les routes de génération

## Installation et lancement

```bash
pnpm install
cp .env.example .env
node ace generate:key
node ace migration:run
pnpm dev
```

## Configuration

Copiez `.env.example` vers `.env`, puis renseignez au minimum :

| Variable | Rôle |
| --- | --- |
| `APP_KEY` | Clé cryptographique AdonisJS, générée avec `node ace generate:key`. |
| `SERVICE_TOKEN` | Jeton attendu par les routes `/internal/*`. |
| `OPENROUTER_API_KEY` | Clé utilisée pour la génération de texte et d'images. |

### Générer le jeton de service

Générez un jeton aléatoire fort avec OpenSSL :

```bash
openssl rand -hex 32
```

Copiez la valeur produite dans le fichier `.env` :

```env
SERVICE_TOKEN=la_valeur_generee
```

Cette commande génère 32 octets aléatoires, encodés sous forme de 64 caractères hexadécimaux. Gardez ce jeton secret et ne le versionnez pas.

## API Endpoints

Toutes les routes internes exigent l'en-tête suivant :

```http
Authorization: Bearer <SERVICE_TOKEN>
```

Une absence ou une valeur invalide renvoie `401`. Si `SERVICE_TOKEN` n'est pas configuré, l'API renvoie `500`.

### `POST /internal/recipes/discover`

Génère un batch de recette à partir d'un prompt.

```bash
curl -X POST http://127.0.0.1:3333/internal/recipes/discover \
  -H 'Authorization: Bearer change-me' \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "Je cherche un repas léger et savoureux.",
  }'
```
