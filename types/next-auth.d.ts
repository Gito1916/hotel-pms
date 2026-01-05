import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    role: string
    organizationId: string
    mustChangePassword: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      role: string
      organizationId: string
      mustChangePassword: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    organizationId: string
    mustChangePassword: boolean
  }
}
