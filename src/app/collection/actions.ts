'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CollectionInsert, CollectionItemInsert } from '@/types/database'

export async function createCollection(
  data: CollectionInsert,
  items: Omit<CollectionItemInsert, 'collection_id'>[]
) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Create collection
  const { data: collection, error: collectionError } = await supabase
    .from('collection')
    .insert({
      ...data,
      created_by: user?.id || null,
    })
    .select()
    .single()

  if (collectionError) {
    return { error: collectionError.message }
  }

  // Create collection items
  if (items.length > 0) {
    const itemsWithCollectionId = items.map(item => ({
      ...item,
      collection_id: collection.id,
    }))

    const { error: itemsError } = await supabase
      .from('collection_item')
      .insert(itemsWithCollectionId)

    if (itemsError) {
      // Rollback collection if items failed
      await supabase.from('collection').delete().eq('id', collection.id)
      return { error: itemsError.message }
    }
  }

  revalidatePath('/collection')
  return { success: true, collection }
}

export async function updateCollection(
  id: number,
  data: Partial<CollectionInsert>,
  items?: Omit<CollectionItemInsert, 'collection_id'>[]
) {
  const supabase = await createClient()

  // Update collection
  const { error: collectionError } = await supabase
    .from('collection')
    .update(data)
    .eq('id', id)

  if (collectionError) {
    return { error: collectionError.message }
  }

  // If items provided, replace all items
  if (items !== undefined) {
    // Delete existing items
    await supabase.from('collection_item').delete().eq('collection_id', id)

    // Insert new items
    if (items.length > 0) {
      const itemsWithCollectionId = items.map(item => ({
        ...item,
        collection_id: id,
      }))

      const { error: itemsError } = await supabase
        .from('collection_item')
        .insert(itemsWithCollectionId)

      if (itemsError) {
        return { error: itemsError.message }
      }
    }
  }

  revalidatePath('/collection')
  return { success: true }
}

export async function deleteCollection(id: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('collection')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/collection')
  return { success: true }
}

export async function reuseCollection(collectionId: number, date: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Get collection items
  const { data: items, error: itemsError } = await supabase
    .from('collection_item')
    .select('*')
    .eq('collection_id', collectionId)

  if (itemsError) {
    return { error: itemsError.message }
  }

  if (!items || items.length === 0) {
    return { error: 'Koleksi tidak memiliki item' }
  }

  // Create transactions from items
  const transactions = items.map(item => ({
    date: new Date(date).toISOString(),
    zone_id: item.zone_id,
    product_id: item.product_id,
    order_qty: item.order_qty,
    notes: item.notes,
    status: 'pending',
    created_by: user?.id || null,
  }))

  const { error: transactionError } = await supabase
    .from('transaction')
    .insert(transactions)

  if (transactionError) {
    return { error: transactionError.message }
  }

  revalidatePath('/collection')
  revalidatePath('/transaction')
  revalidatePath('/dashboard')
  return { success: true, count: transactions.length }
}

export async function getCollectionWithItems(id: number) {
  const supabase = await createClient()

  const { data: collection, error: collectionError } = await supabase
    .from('collection')
    .select('*')
    .eq('id', id)
    .single()

  if (collectionError) {
    return { error: collectionError.message }
  }

  const { data: items, error: itemsError } = await supabase
    .from('collection_item')
    .select(`
      *,
      customer:zone_id(*),
      product:product_id(*)
    `)
    .eq('collection_id', id)

  if (itemsError) {
    return { error: itemsError.message }
  }

  return {
    collection: {
      ...collection,
      items: items || [],
      item_count: items?.length || 0,
    },
  }
}
