const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions={
    httpOnly: true,       
    secure: false, 
    sameSite: 'None', 
    maxAge: 30 * 24 * 60 * 60 * 1000,
}

module.exports={cookieOptions}