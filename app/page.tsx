'use client'

import { useState, useEffect } from 'react'

interface Author {
  id: string
  name: string
  email: string
  nationality: string
  birthYear: number
  bio: string
  books: Book[]
}

interface Book {
  id: string
  title: string
  description: string
  isbn: string
  genre: string
  publishedYear: number
  pages: number
  authorId: string
  author?: Author
}

type Tab = 'authors' | 'books'
type Modal = 'none' | 'addAuthor' | 'editAuthor' | 'addBook' | 'editBook' | 'viewAuthor'

export default function Home() {
  const [tab, setTab] = useState<Tab>('authors')
  const [authors, setAuthors] = useState<Author[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<Modal>('none')
  const [selected, setSelected] = useState<Author | Book | null>(null)
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    const [a, b] = await Promise.all([fetch('/api/authors'), fetch('/api/books')])
    setAuthors(await a.json())
    setBooks(await b.json())
    setLoading(false)
  }

  const openAdd = (type: 'author' | 'book') => {
    setForm({})
    setSelected(null)
    setModal(type === 'author' ? 'addAuthor' : 'addBook')
  }

  const openEdit = (item: Author | Book, type: 'author' | 'book') => {
    setForm(item)
    setSelected(item)
    setModal(type === 'author' ? 'editAuthor' : 'editBook')
  }

  const openView = (author: Author) => {
    setSelected(author)
    setModal('viewAuthor')
  }

  const closeModal = () => { setModal('none'); setForm({}); setSelected(null) }

  const saveAuthor = async () => {
    setSaving(true)
    if (modal === 'addAuthor') {
      await fetch('/api/authors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch(`/api/authors/${(selected as Author).id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    await fetchAll(); setSaving(false); closeModal()
  }

  const deleteAuthor = async (id: string) => {
    if (!confirm('¿Eliminar autor?')) return
    await fetch(`/api/authors/${id}`, { method: 'DELETE' })
    await fetchAll()
  }

  const saveBook = async () => {
    setSaving(true)
    if (modal === 'addBook') {
      await fetch('/api/books', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, pages: Number(form.pages), publishedYear: Number(form.publishedYear) }) })
    } else {
      await fetch(`/api/books/${(selected as Book).id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, pages: Number(form.pages), publishedYear: Number(form.publishedYear) }) })
    }
    await fetchAll(); setSaving(false); closeModal()
  }

  const deleteBook = async (id: string) => {
    if (!confirm('¿Eliminar libro?')) return
    await fetch(`/api/books/${id}`, { method: 'DELETE' })
    await fetchAll()
  }

  const filteredAuthors = authors.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #150f25 0%, #28183c 50%, #150f25 100%)', fontFamily: "'Georgia', serif", padding: '2rem' }}>
      
      {/* Header */}
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📚</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, background: 'linear-gradient(90deg, #9c36a3, #672b7d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            Sistema de Biblioteca
          </h1>
          <p style={{ color: '#9c36a3', marginTop: '0.5rem', letterSpacing: 2, fontSize: '0.85rem', textTransform: 'uppercase' }}>
            Next.js · Prisma · Supabase
          </p>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Buscar..."
            style={{ width: '100%', padding: '0.85rem 1.2rem', borderRadius: 12, border: '1px solid #402259', background: '#28183c', color: '#fff', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: '1.5rem' }}>
          {(['authors', 'books'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '0.6rem 1.5rem', borderRadius: 999, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.2s',
              background: tab === t ? 'linear-gradient(90deg, #672b7d, #9c36a3)' : '#28183c',
              color: tab === t ? '#fff' : '#9c36a3',
              boxShadow: tab === t ? '0 4px 20px #9c36a355' : 'none'
            }}>
              {t === 'authors' ? `✍️ Autores (${authors.length})` : `📖 Libros (${books.length})`}
            </button>
          ))}
          <button onClick={() => openAdd(tab === 'authors' ? 'author' : 'book')} style={{
            marginLeft: 'auto', padding: '0.6rem 1.5rem', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(90deg, #402259, #672b7d)', color: '#fff', fontWeight: 700, fontSize: '0.95rem',
            boxShadow: '0 4px 20px #67277755'
          }}>
            + Agregar
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#9c36a3', padding: '4rem', fontSize: '1.2rem' }}>Cargando...</div>
        ) : tab === 'authors' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filteredAuthors.map(author => (
              <div key={author.id} style={{ background: 'linear-gradient(135deg, #28183c, #402259)', borderRadius: 16, padding: '1.5rem', border: '1px solid #402259', boxShadow: '0 8px 32px #00000044', transition: 'transform 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #672b7d, #9c36a3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>✍️</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openView(author)} style={{ background: '#402259', border: 'none', borderRadius: 8, padding: '4px 10px', color: '#9c36a3', cursor: 'pointer', fontSize: '0.8rem' }}>Ver</button>
                    <button onClick={() => openEdit(author, 'author')} style={{ background: '#402259', border: 'none', borderRadius: 8, padding: '4px 10px', color: '#9c36a3', cursor: 'pointer', fontSize: '0.8rem' }}>Editar</button>
                    <button onClick={() => deleteAuthor(author.id)} style={{ background: '#3d1a1a', border: 'none', borderRadius: 8, padding: '4px 10px', color: '#ff6b6b', cursor: 'pointer', fontSize: '0.8rem' }}>Eliminar</button>
                  </div>
                </div>
                <h3 style={{ color: '#fff', margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700 }}>{author.name}</h3>
                <p style={{ color: '#9c36a3', fontSize: '0.8rem', margin: '0 0 8px' }}>{author.email}</p>
                <p style={{ color: '#ccc', fontSize: '0.85rem', margin: '0 0 12px', lineHeight: 1.5 }}>{author.bio?.substring(0, 80)}{author.bio?.length > 80 ? '...' : ''}</p>
                <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: '#9c36a3' }}>
                  <span>🌍 {author.nationality}</span>
                  <span>📅 {author.birthYear}</span>
                  <span>📖 {author.books?.length || 0} libros</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filteredBooks.map(book => (
              <div key={book.id} style={{ background: 'linear-gradient(135deg, #28183c, #402259)', borderRadius: 16, padding: '1.5rem', border: '1px solid #402259', boxShadow: '0 8px 32px #00000044', transition: 'transform 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #672b7d, #9c36a3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📖</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(book, 'book')} style={{ background: '#402259', border: 'none', borderRadius: 8, padding: '4px 10px', color: '#9c36a3', cursor: 'pointer', fontSize: '0.8rem' }}>Editar</button>
                    <button onClick={() => deleteBook(book.id)} style={{ background: '#3d1a1a', border: 'none', borderRadius: 8, padding: '4px 10px', color: '#ff6b6b', cursor: 'pointer', fontSize: '0.8rem' }}>Eliminar</button>
                  </div>
                </div>
                <h3 style={{ color: '#fff', margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700 }}>{book.title}</h3>
                <p style={{ color: '#9c36a3', fontSize: '0.8rem', margin: '0 0 8px' }}>por {book.author?.name}</p>
                <p style={{ color: '#ccc', fontSize: '0.85rem', margin: '0 0 12px', lineHeight: 1.5 }}>{book.description?.substring(0, 80)}{book.description?.length > 80 ? '...' : ''}</p>
                <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: '#9c36a3', flexWrap: 'wrap' }}>
                  <span>🎭 {book.genre}</span>
                  <span>📅 {book.publishedYear}</span>
                  <span>📄 {book.pages} págs</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal !== 'none' && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000088', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #28183c, #402259)', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 480, border: '1px solid #672b7d', boxShadow: '0 20px 60px #00000088', maxHeight: '90vh', overflowY: 'auto' }}>
            
            {modal === 'viewAuthor' && selected && (
              <>
                <h2 style={{ color: '#9c36a3', margin: '0 0 1.5rem', fontSize: '1.4rem' }}>👤 {(selected as Author).name}</h2>
                {[['Email', (selected as Author).email], ['Nacionalidad', (selected as Author).nationality], ['Año de nacimiento', (selected as Author).birthYear], ['Biografía', (selected as Author).bio]].map(([label, val]) => (
                  <div key={label as string} style={{ marginBottom: '1rem' }}>
                    <div style={{ color: '#9c36a3', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                    <div style={{ color: '#fff', fontSize: '0.95rem' }}>{val}</div>
                  </div>
                ))}
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ color: '#9c36a3', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Libros</div>
                  {(selected as Author).books?.length === 0 ? <p style={{ color: '#888' }}>Sin libros</p> : (selected as Author).books?.map(b => (
                    <div key={b.id} style={{ background: '#150f25', borderRadius: 8, padding: '0.5rem 0.75rem', marginBottom: 6, color: '#ccc', fontSize: '0.9rem' }}>📖 {b.title}</div>
                  ))}
                </div>
                <button onClick={closeModal} style={{ marginTop: '1.5rem', width: '100%', padding: '0.75rem', borderRadius: 12, border: 'none', background: '#402259', color: '#9c36a3', cursor: 'pointer', fontWeight: 700 }}>Cerrar</button>
              </>
            )}

            {(modal === 'addAuthor' || modal === 'editAuthor') && (
              <>
                <h2 style={{ color: '#9c36a3', margin: '0 0 1.5rem', fontSize: '1.4rem' }}>{modal === 'addAuthor' ? '➕ Nuevo Autor' : '✏️ Editar Autor'}</h2>
                {[['name', 'Nombre *', 'text'], ['email', 'Email *', 'email'], ['nationality', 'Nacionalidad', 'text'], ['birthYear', 'Año de nacimiento', 'number']].map(([key, label, type]) => (
                  <div key={key} style={{ marginBottom: '1rem' }}>
                    <label style={{ color: '#9c36a3', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>{label}</label>
                    <input type={type} value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })}
                      style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #672b7d', background: '#150f25', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: '#9c36a3', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Biografía</label>
                  <textarea value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3}
                    style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #672b7d', background: '#150f25', color: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={closeModal} style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: 'none', background: '#150f25', color: '#9c36a3', cursor: 'pointer', fontWeight: 700 }}>Cancelar</button>
                  <button onClick={saveAuthor} disabled={saving} style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: 'none', background: 'linear-gradient(90deg, #672b7d, #9c36a3)', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </>
            )}

            {(modal === 'addBook' || modal === 'editBook') && (
              <>
                <h2 style={{ color: '#9c36a3', margin: '0 0 1.5rem', fontSize: '1.4rem' }}>{modal === 'addBook' ? '➕ Nuevo Libro' : '✏️ Editar Libro'}</h2>
                {[['title', 'Título *', 'text'], ['isbn', 'ISBN', 'text'], ['genre', 'Género', 'text'], ['publishedYear', 'Año publicación', 'number'], ['pages', 'Páginas', 'number']].map(([key, label, type]) => (
                  <div key={key} style={{ marginBottom: '1rem' }}>
                    <label style={{ color: '#9c36a3', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>{label}</label>
                    <input type={type} value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })}
                      style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #672b7d', background: '#150f25', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: '#9c36a3', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Autor *</label>
                  <select value={form.authorId || ''} onChange={e => setForm({ ...form, authorId: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #672b7d', background: '#150f25', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}>
                    <option value=''>Seleccionar autor</option>
                    {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: '#9c36a3', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Descripción</label>
                  <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                    style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #672b7d', background: '#150f25', color: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={closeModal} style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: 'none', background: '#150f25', color: '#9c36a3', cursor: 'pointer', fontWeight: 700 }}>Cancelar</button>
                  <button onClick={saveBook} disabled={saving} style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: 'none', background: 'linear-gradient(90deg, #672b7d, #9c36a3)', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}