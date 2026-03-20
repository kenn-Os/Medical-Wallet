'use server'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveAllergy(payload, id = null) {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { error: 'Not authenticated' }

    const finalPayload = {
      ...payload,
      user_id: user.id,
      updated_at: new Date().toISOString()
    }

    let result
    if (id) {
      // Update
      const { user_id, ...updateData } = finalPayload
      result = await adminSupabase
        .from('allergies')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()
    } else {
      // Insert
      result = await adminSupabase
        .from('allergies')
        .insert(finalPayload)
        .select()
        .single()
    }

    if (result.error) {
      console.error('Server Action Error (saveAllergy):', result.error)
      return { error: result.error.message }
    }

    revalidatePath('/records')
    revalidatePath('/dashboard')
    return { data: result.data }
  } catch (err) {
    console.error('Server Action Exception (saveAllergy):', err)
    return { error: 'Internal server error' }
  }
}

export async function deleteAllergy(id) {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await adminSupabase
      .from('allergies')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/records')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err) {
    return { error: 'Internal server error' }
  }
}
