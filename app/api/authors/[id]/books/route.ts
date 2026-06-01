import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const author = await prisma.author.findUnique({ where: { id } })
    if (!author) {
      return NextResponse.json({ error: 'Autor no encontrado' }, { status: 404 })
    }

    const books = await prisma.book.findMany({
      where: { authorId: id }
    })
    return NextResponse.json(books)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener libros del autor' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, isbn, publishedYear, genre, pages } = body

    if (!title) {
      return NextResponse.json({ error: 'Title es requerido' }, { status: 400 })
    }

    const author = await prisma.author.findUnique({ where: { id } })
    if (!author) {
      return NextResponse.json({ error: 'Autor no encontrado' }, { status: 404 })
    }

    const book = await prisma.book.create({
      data: { title, description, isbn, publishedYear, genre, pages, authorId: id },
      include: { author: true }
    })
    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear libro' }, { status: 500 })
  }
}
