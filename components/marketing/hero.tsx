import Image from "next/image";

export function Hero() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <div className="flex gap-8 justify-center items-center">
        <a href="https://www.votophoto.com" target="_blank" rel="noreferrer">
          <Image
            src="/images/votophoto-logo-wide.svg"
            alt="VotoPhoto"
            width={400}
            height={98}
          />
        </a>
      </div>
      <h1 className="sr-only">Welcome to votophoto</h1>
      <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
        Host your own photo contests.
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
