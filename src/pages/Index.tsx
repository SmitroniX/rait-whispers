import { ConfessionForm } from "@/components/ConfessionForm";
import { ConfessionList } from "@/components/ConfessionList";
import { Navigation } from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Share Your Thoughts</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A safe and anonymous space for RAIT students to share confessions, thoughts, and secrets.
              Your identity is completely protected.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <ConfessionForm />
          </div>
        </section>

        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Recent Confessions</h2>
          <div className="max-w-4xl mx-auto">
            <ConfessionList />
          </div>
        </section>
      </main>

      <footer className="border-t border-primary/20 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 RAIT Confession. All confessions are anonymous and protected.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
