import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const { email, password } = credentials;
        
        // console.log("Received credentials:", { email, password });  // Log credentials

        try {
          const response = await fetch("https://todos-api-aeaf.onrender.com/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          });

          // console.log("Response status:", response.status); 
          
          //  console.log(response)
          const data = await response.json();
          // console.log("Response data:", data);  // Log response body

          if (!response.ok) {
            console.error("Authentication failed. Response is not OK.");
            return null;
          }
            // console.log(data.data.token)
      
          if (!data.data.token) {
            console.error("No token found in the response.");
            return null;
          }

          return { 
            // id: data, 
            email: data.data.email, 
            name: data.data.name, 
            token: data.data.token 
          };
        } catch (error) {
          console.error("Authentication Error:", error);  
          return null;
        }
      }
    })
  ],
  pages: { 
    signIn: "/login" 
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // console.log("JWT callback: user data", user);  // Log user data
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.token = user.token;
      }
      // console.log("token of the user" ,token.token)
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = { 
          id: token.id, 
          email: token.email, 
          name: token.name, 
          token: token.token 
        };
      }
      // console.log('session data of the user ' ,session)
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

export default NextAuth(authOptions);
