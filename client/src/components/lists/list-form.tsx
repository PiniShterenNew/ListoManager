const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.name?.trim()) {
    toast({
      title: "שגיאה",
      description: "שם הרשימה הוא שדה חובה",
      variant: "destructive",
    });
    return;
  }
  try {
    await onSubmit(formData);
  } catch (error) {
    toast({
      title: "שגיאה",
      description: error instanceof Error ? error.message : "אירעה שגיאה בעת שמירת הרשימה",
      variant: "destructive",
    });
  }
};