import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const genre = searchParams.get('genre') || ''
    const authorName = searchParams.get('authorName') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    const validSortFields = ['title', 'publishedYear', 'createdAt']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const sortOrder = order === 'asc' ? 'asc' : 'desc'

    const where: any = {
      AND: [
        search ? { title: { contains: search, mode: 'insensitive' } } : {},
        genre ? { genre: { equals: genre } } : {},
        authorName ? { author: { name: { contains: authorName, mode: 'insensitive' } } } : {}
      ]
    }

    const total = await prisma.book.count({ where })
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    const data = await prisma.book.findMany({
      where,
      include: { author: true },
      orderBy: { [sortField]: sortOrder },
      skip,
      take: limit
    })

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error en la búsqueda' }, { status: 500 })
  }
}