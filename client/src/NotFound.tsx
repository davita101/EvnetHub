export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center gap-4">
      <h1 className="text-3xl font-bold">
        404 not found და ვერც ეს მოვასწარით 😔
      </h1>
      <img
      className="animate-spin duration-1000 delay-200"
        src="https://upload.wikimedia.org/wikipedia/en/0/03/Walter_White_S5B.png"
        alt=""
      />
    </div>
  );
}
