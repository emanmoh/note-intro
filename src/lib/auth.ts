// src/lib/auth.ts
import NextAuth, { AuthOptions, SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from '@/lib/prisma';
import bcrypt from "bcrypt";

// Udvid NextAuth-typen for session
declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Tilføj id her
      name?: string;
      email?: string;
      image?: string;
    };
  }
}

// NextAuth-konfigurationen
export const authOptions: AuthOptions = {
  
  providers: [
    // Credentials provider til login med email og password
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.error("Test ENV.");
        console.log(process.env.DATABASE_URL);
        if (!credentials?.email || !credentials?.password) {
          console.error("Email or password not provided.");
          return null; // Hvis email eller password ikke er givet
        }

        try {
          // Find bruger baseret på email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.error("User not found.");
            return null; // Hvis bruger ikke findes
          }

          // Tjek adgangskoden med bcrypt
          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordCorrect) {
            console.error("Incorrect password.");
            return null; // Hvis adgangskoden ikke matcher
          }

          // Returner brugerens data (NextAuth bruger disse data til at oprette sessionen)
          return { id: user.id, name: user.name, email: user.email };
        } catch (error) {
          console.error("Error during password comparison:", error);
          return null; // Hvis der opstår en fejl
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as SessionStrategy, // Bruger JWT til session management
  },
  callbacks: {
    async session({ session, token }) {
      // Tilføj id til session, hvis token.sub eksisterer
      if (session.user && token?.sub) {
        session.user.id = token.sub; // Tilføj id til session.user
      }
      return session;
    },
  },
  pages: {
    //login-side
    signIn: "/login",
  },
};

export default NextAuth(authOptions);

// Funktion til at oprette en bruger med bcrypt hashning af adgangskode
export async function createUser(name: string, email: string, password: string) {
  // Tjek om emailen allerede er i brug
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email is already in use.");
  }

  // Hash adgangskoden
  const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

  try {
    // Opret en ny bruger i databasen
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // Gem den hashede adgangskode
      },
    });
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Unable to create user. Please try again.");
  }
}
