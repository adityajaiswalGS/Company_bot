// src/app/api/create-user/route.js
import { supabaseAdmin } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password, fullName, companyId } = await request.json();

    if (!email || !password || !fullName || !companyId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { data: newUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      if (authError.message?.includes('already')) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 409 }
        );
      }
      throw authError;
    }

    const userId = newUser.user.id;

    const { error: rpcError } = await supabaseAdmin.rpc(
      'create_company_user',
      {
        _id: userId,
        _full_name: fullName,
        _company_id: companyId
      }
    );

    if (rpcError) throw rpcError;

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err) {
    console.error('Create user error:', err);
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
