const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions={
    httpOnly: true,       
    secure: isProduction, 
    sameSite: isProduction ? 'none' : 'lax', 
    domain: isProduction ? '.yourdomain.com' : 'localhost',
    maxAge: 30 * 24 * 60 * 60 * 1000,
}

module.exports={cookieOptions}