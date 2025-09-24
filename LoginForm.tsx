import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Mail, Phone, Eye, EyeOff, Github, Chrome } from "lucide-react";

interface LoginFormProps {
  onLogin: (credentials: { email?: string; phone?: string; password: string }) => void;
  onSocialLogin: (provider: 'google' | 'github') => void;
}

const LoginForm = ({ onLogin, onSocialLogin }: LoginFormProps) => {
  const [loginData, setLoginData] = useState({
    email: '',
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginType === 'email') {
      onLogin({ email: loginData.email, password: loginData.password });
    } else {
      onLogin({ phone: loginData.phone, password: loginData.password });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Добро пожаловать</CardTitle>
          <CardDescription>
            Войдите в свою учётную запись
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Social Login */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onSocialLogin('google')}
              data-testid="button-login-google"
            >
              <Chrome className="h-4 w-4 mr-2" />
              Войти через Google
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onSocialLogin('github')}
              data-testid="button-login-github"
            >
              <Github className="h-4 w-4 mr-2" />
              Войти через GitHub
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                или
              </span>
            </div>
          </div>
          
          {/* Email/Phone Tabs */}
          <Tabs value={loginType} onValueChange={(value) => setLoginType(value as 'email' | 'phone')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Телефон
              </TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <TabsContent value="email" className="space-y-4 mt-0">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@mail.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    data-testid="input-email"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="phone" className="space-y-4 mt-0">
                <div>
                  <Label htmlFor="phone">Номер телефона</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+7 (999) 123-45-67"
                    value={loginData.phone}
                    onChange={(e) => setLoginData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    data-testid="input-phone"
                  />
                </div>
              </TabsContent>
              
              <div>
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите пароль"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    data-testid="input-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                data-testid="button-login"
              >
                Войти
              </Button>
            </form>
          </Tabs>
          
          <div className="text-center text-sm text-muted-foreground">
            Нет аккаунта?{' '}
            <Button variant="ghost" className="p-0 h-auto font-medium text-primary hover:text-primary/80">
              Зарегистрироваться
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;