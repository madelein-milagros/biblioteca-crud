import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: { author: true }
    })
    if (!book) {
      return NextResponse.json({ error: 'Libro no encontrado' }, { status: 404 })
    }
    return NextResponse.json(book)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener libro' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params
    const body = await request.json()
    const { title, description, isbn, publishedYear, genre, pages, authorId } = body

    const book = await prisma.book.update({
      where: { id: bookId },
      data: { title, description, isbn, publishedYear, genre, pages, authorId },
      include: { author: true }
    })
    return NextResponse.json(book)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar libro' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params
    await prisma.book.delete({ where: { id: bookId } })
    return NextResponse.json({ message: 'Libro eliminado' })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar libro' }, { status: 500 })
  }
}