'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ProductInsert } from '@/types/database'

export async function createProduct(data: ProductInsert) {
  const supabase = await createClient()

  const { error } = await supabase.from('product').insert(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/product')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateProduct(id: number, data: Partial<ProductInsert>) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('product')
    .update(data)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/product')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteProduct(id: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('product')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/product')
  revalidatePath('/dashboard')
  return { success: true }
}
