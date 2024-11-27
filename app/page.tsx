import Image from "next/image";
import TopNavigation from "./homepage/TopNavigation";
import Hero from "./homepage/hero";

export default function Home() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <TopNavigation />
        <Hero />
        {/* Main Content
        <main className="flex-1">
          <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
            <div className="flex max-w-[980px] flex-col items-start gap-2">
              <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                Welcome to ACME
                <br className="hidden sm:inline" />
                Your Trusted Partner in Innovation
              </h1>
              <p className="max-w-[700px] text-lg text-muted-foreground">
                Discover our cutting-edge solutions and services designed to
                propel your business forward.
              </p>
            </div>
          </section>

          {/* Cards Section */}
        {/*<section className="container py-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Product A</CardTitle>
                  <CardDescription>
                    Our flagship product for enterprise solutions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Experience unparalleled performance and reliability with
                    Product A.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button>Learn More</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Service B</CardTitle>
                  <CardDescription>
                    Comprehensive consulting for your business needs.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Our expert team provides tailored solutions to drive your
                    success.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button>Get Started</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Solution C</CardTitle>
                  <CardDescription>
                    Innovative technology for the modern workplace.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Streamline your operations with our cutting-edge Solution C.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button>Explore</Button>
                </CardFooter>
              </Card>
            </div>
          </section>
        </main> */}
        {/* Footer */}
        {/* <footer className="border-t">
          <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
            <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
              <p className="text-center text-sm leading-loose md:text-left">
                Built by ACME. The source code is available on GitHub.
              </p>
            </div>
          </div>
        </footer> */}
      </div>
    </>
  );
}
