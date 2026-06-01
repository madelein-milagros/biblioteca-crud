# next-api-routes

API REST construida con Next.js App Router, Prisma y PostgreSQL. Gestiona autores y sus libros.

## Stack

- **Next.js** (App Router) — rutas de API con Route Handlers
- **Prisma** — ORM para acceso a base de datos
- **PostgreSQL** — base de datos relacional

## Modelos

**Author** — `id`, `name`, `email` (único), `nationality`, `birthYear`, `bio`

**Book** — `id`, `title`, `description`, `isbn` (único), `publishedYear`, `genre`, `pages`, `authorId`

Un autor puede tener muchos libros. Al eliminar un autor se eliminan sus libros en cascada.

## Configuración

1. Instalar dependencias:

```bash
npm install
```

2. Crear el archivo `.env` con las variables de entorno:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
DIRECT_URL="postgresql://user:password@host:port/database"
```

3. Aplicar las migraciones de Prisma:

```bash
npx prisma migrate dev
```

4. Iniciar el servidor de desarrollo:

```bash
npm run dev
```

La API estará disponible en `http://localhost:3000`.

## Endpoints

### Autores

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/authors` | Lista todos los autores (incluye sus libros) |
| POST | `/api/authors` | Crea un autor (`name` y `email` requeridos) |
| GET | `/api/authors/[id]` | Obtiene un autor por ID |
| PUT | `/api/authors/[id]` | Actualiza un autor |
| DELETE | `/api/authors/[id]` | Elimina un autor (y sus libros) |
| GET | `/api/authors/[id]/books` | Lista los libros de un autor |
| POST | `/api/authors/[id]/books` | Crea un libro para ese autor (`title` requerido) |
| GET | `/api/authors/[id]/stats` | Estadísticas del autor (total libros, páginas, géneros, etc.) |

### Libros

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/books` | Lista todos los libros. Acepta `?genre=` para filtrar |
| POST | `/api/books` | Crea un libro (`title` y `authorId` requeridos) |
| GET | `/api/books/[bookId]` | Obtiene un libro por ID (incluye autor) |
| PUT | `/api/books/[bookId]` | Actualiza un libro |
| DELETE | `/api/books/[bookId]` | Elimina un libro |
| GET | `/api/books/search` | Busca libros por título, género o autor |

## Ejemplos de uso

Crear un autor:
```bash
curl -X POST http://localhost:3000/api/authors \
  -H "Content-Type: application/json" \
  -d '{"name": "Gabriel García Márquez", "email": "gabo@example.com", "nationality": "Colombiana", "birthYear": 1927}'
```

Listar libros de un autor:
```bash
curl http://localhost:3000/api/authors/<id>/books
```

Filtrar libros por género:
```bash
curl http://localhost:3000/api/books?genre=Realismo%20mágico
```
