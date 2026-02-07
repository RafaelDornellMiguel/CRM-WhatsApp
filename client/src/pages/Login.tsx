import { getLoginUrl } from "@/const"; // Importe a função que ajustamos acima

export default function Login() {
  
  const handleLogin = () => {
    // Redireciona o navegador para a URL calculada (Dev ou Google)
    window.location.href = getLoginUrl();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Bem-vindo ao CRM
          </h1>
          <p className="text-sm text-muted-foreground">
            Entre para gerenciar seu WhatsApp
          </p>
        </div>

        <div className="grid gap-6">
          <button
            onClick={handleLogin}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            {/* Texto dinâmico opcional */}
            {import.meta.env.VITE_LOGIN_PROVIDER === 'dev' ? 'Entrar (Modo Dev)' : 'Entrar com Google'}
          </button>
        </div>
      </div>
    </div>
  );
}