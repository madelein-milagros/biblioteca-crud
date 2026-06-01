import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const author = await prisma.author.findUnique({
      where: { id },
      include: { books: true }
    })

    if (!author) {
      return NextResponse.json({ error: 'Autor no encontrado' }, { status: 404 })
    }

    const totalBooks = author.books.length

    const genres = author.books.reduce((acc: Record<string, number>, book) => {
      const genre = book.genre || 'Sin género'
      acc[genre] = (acc[genre] || 0) + 1
      return acc
    }, {})

    const totalPages = author.books.reduce((acc, book) => acc + (book.pages || 0), 0)

    const averagePages = totalBooks > 0 ? Math.round(totalPages / totalBooks) : 0

    const publishedYears = author.books
      .map(book => book.publishedYear)
      .filter(Boolean) as number[]

    const oldestBook = publishedYears.length > 0 ? Math.min(...publishedYears) : null
    const newestBook = publishedYears.length > 0 ? Math.max(...publishedYears) : null

    return NextResponse.json({
      author: {
        id: author.id,
        name: author.name,
        email: author.email,
        nationality: author.nationality,
        birthYear: author.birthYear
      },
      stats: {
        totalBooks,
        totalPages,
        averagePages,
        genres,
        oldestBook,
        newestBook
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }
}