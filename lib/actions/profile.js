'use server'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveProfile(payload) {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const finalPayload = {
      ...payload,
      user_id: user.id,
      updated_at: new Date().toISOString()
    }

    // Use admin client to upsert profile
    const { data, error } = await adminSupabase
      .from('profiles')
      .upsert(finalPayload, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      console.error('Server Action Error (saveProfile):', error)
      return { error: error.message }
    }

    revalidatePath('/profile')
    revalidatePath('/dashboard')
    return { data }
  } catch (err) {
    console.error('Server Action Exception (saveProfile):', err)
    return { error: 'Internal server error' }
  }
}
