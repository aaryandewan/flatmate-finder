import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/mongodb";
import User, { IUser } from "@/models/User";

// Define auth options directly in the handler
const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: any }) {
      await dbConnect();

      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        const newUser = new User({
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          isProfileComplete: false,
        });
        await newUser.save();
      }
      return true;
    },
    async session({ session }: { session: any }) {
      await dbConnect();
      const dbUser = await User.findOne({ email: session.user?.email });
      if (dbUser) {
        session.user.id = dbUser._id.toString();
        session.user.isProfileComplete = dbUser.isProfileComplete;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Use the NextAuth function for GET and POST requests
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
