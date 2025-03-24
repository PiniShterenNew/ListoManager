import { useAuth, loginSchema, registerSchema } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      avatarUrl: "",
    },
  });

  const onLogin = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Hero section (hidden on small screens, visible on lg and up) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-purple-600 text-white p-12 flex-col justify-center">
        <div className="max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-lg p-4 rounded-lg w-14 h-14 flex items-center justify-center mb-8">
            <div className="bg-white text-primary w-10 h-10 rounded-md flex items-center justify-center">
              <span className="text-xl font-bold">L</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-6">ברוכים הבאים ל-Listo</h1>
          <p className="text-lg mb-6 text-white/90">
            נהל את רשימות הקניות שלך בצורה חכמה. יצירת רשימות, שיתוף עם משפחה וחברים, ומעקב אחר הפריטים הנדרשים - הכל במקום אחד.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-10">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-2xl mb-2">✓</div>
              <h3 className="font-medium mb-1">ניהול רשימות קל</h3>
              <p className="text-sm text-white/80">צור רשימות קניות מותאמות אישית בקלות ובמהירות</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-2xl mb-2">✓</div>
              <h3 className="font-medium mb-1">שיתוף פעולה</h3>
              <p className="text-sm text-white/80">שתף רשימות עם משפחה וחברים לעבודה יעילה יותר</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-2xl mb-2">✓</div>
              <h3 className="font-medium mb-1">מעקב מלאי</h3>
              <p className="text-sm text-white/80">עקוב בקלות אחר המוצרים שכבר רכשת ואלו שעדיין חסרים</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-2xl mb-2">✓</div>
              <h3 className="font-medium mb-1">נגיש מכל מקום</h3>
              <p className="text-sm text-white/80">השתמש באפליקציה מכל מכשיר ובכל זמן שתרצה</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth section */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo visible only on mobile */}
          <div className="flex justify-center lg:hidden mb-6">
            <div className="bg-primary text-white w-12 h-12 rounded-md flex items-center justify-center">
              <span className="text-xl font-bold">L</span>
            </div>
          </div>
          
          <h2 className="text-center text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {activeTab === "login" ? "התחברות ל-Listo" : "הרשמה ל-Listo"}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {activeTab === "login" ? "אין לך חשבון? " : "יש לך כבר חשבון? "}
            <Button
              variant="link"
              className="p-0 font-medium text-primary hover:text-primary/80"
              onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
            >
              {activeTab === "login" ? "הרשם עכשיו" : "התחבר"}
            </Button>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="border-0 shadow-lg sm:rounded-xl">
            <CardContent className="p-6 sm:p-8">
              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/30">
                  <TabsTrigger value="login" className="text-sm sm:text-base py-2">התחברות</TabsTrigger>
                  <TabsTrigger value="register" className="text-sm sm:text-base py-2">הרשמה</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>כתובת אימייל</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="your@email.com" 
                                type="email" 
                                {...field} 
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>סיסמה</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                {...field} 
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full mt-8 py-6 h-auto text-base"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "מתחבר..." : "התחבר"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>שם מלא</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="ישראל ישראלי" 
                                {...field} 
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>כתובת אימייל</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="your@email.com" 
                                type="email" 
                                {...field} 
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>סיסמה</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                {...field} 
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="avatarUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>תמונת פרופיל (אופציונלי)</FormLabel>
                            <FormControl>
                              <div className="my-2">
                                <ImageUpload 
                                  currentImage={field.value} 
                                  onImageChange={(imageBase64: string) => {
                                    field.onChange(imageBase64);
                                  }}
                                  className="max-w-xs mx-auto"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full mt-6 py-6 h-auto text-base"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "מתבצעת הרשמה..." : "הרשם"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
