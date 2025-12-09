// src/app/api/create-user/route.js
import { supabaseAdmin } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password, fullName, companyId } = await request.json();

    if (!email || !password || !fullName || !companyId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Create user with service key
    const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 });
      }
      throw authError;
    }

    // UPSERT PROFILE — NEVER BREAKS ON DUPLICATE
    const { error: upsertError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: newUser.user.id,
          full_name: fullName,
          role: 'user',
          company_id: companyId,
        },
        { onConflict: 'id' }
      );

    if (upsertError) throw upsertError;

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('Create user error:', err);
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 });
  }
}