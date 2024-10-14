import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: AuthOptions = {
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
    async session({ session }) {
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
