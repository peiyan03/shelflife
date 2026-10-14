import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/** Serves samples/receipt-1.jpg so the sample receipt can be viewed, and proves the file is in the bundle. */
export async function GET() {
  try {
    const buf = await readFile(path.join(process.cwd(), 'samples', 'receipt-1.jpg'))
    return new NextResponse(new Uint8Array(buf), {
      headers: { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=86400' },
    })
  } catch {
    return new NextResponse('sample missing', { status: 404 })
  }
}
