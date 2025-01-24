
import Image from "next/image";
import logo from '../../public/image.png'
export default function HomePage() {
  return (
    <main>
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-white bg-gray-900">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="flex justify-center">
      <Image className="rounded-lg" src={logo} alt="Example Image" width={300} height={300} />
          </div>
          <section className="space-y-4">
            <h1 className="text-4xl font-bold font-jersey">Welcome to Your <span className=" rounded-md bg-red-500 px-1 text-black font-mono">Task Manager App</span></h1>
           
          </section>
        </div>
      </div>
    </main>
  );
}
