"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const bookSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(5, { message: "Phone number is required." }),
  preferredDate: z.string().min(1, { message: "Please select a date." }),
  serviceType: z.string().min(1, { message: "Please select a service." }),
  notes: z.string().optional(),
});

export default function BookAppointmentPage() {
  const t = useTranslations("Navigation");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof bookSchema>>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      preferredDate: "",
      serviceType: "",
      notes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof bookSchema>) {
    setIsSubmitting(true);
    // Simulate API Database Appointment Registration
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Appointment Booked", values);
    setIsSubmitting(false);
    setIsSuccess(true);
    form.reset();
  }

  const services = [
    "Conseil", "Assistance", "Rédaction", "Négociation", "Contentieux", "Accompagnement", "Audit"
  ];

  return (
    <div className="flex flex-col w-full bg-slate-50 min-h-screen">
      <section className="pt-24 pb-16 bg-primary text-white text-center">
        <div className="container mx-auto px-4 md:px-8 max-w-2xl">
          <div className="inline-flex items-center justify-center p-4 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
            <CalendarIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Book a Consultation</h1>
          <p className="text-lg text-primary-foreground/90 font-light">
            Secure a confidential appointment with our lead attorneys to map out your legal strategy.
          </p>
        </div>
      </section>

      <section className="py-16 -mt-10">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 relative">
            
            {isSuccess ? (
              <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center text-center p-8 rounded-3xl">
                <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">Appointment Requested</h3>
                <p className="text-lg text-slate-600 max-w-md mb-8">
                  Your consultation request has been successfully submitted. Our secretariat will contact you shortly to confirm the exact time slot.
                </p>
                <Button onClick={() => setIsSuccess(false)} variant="outline" size="lg" className="rounded-full px-8">Book Another</Button>
              </div>
            ) : null}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" /> Meeting Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Required <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <select 
                              className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                              {...field}
                            >
                              <option value="">Select a service category</option>
                              {services.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="preferredDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Date <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input type="date" className="bg-white" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" className="bg-slate-50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" className="bg-slate-50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="+1 234 567 890" className="bg-slate-50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Briefly describe the context of your appointment..." 
                          className="min-h-[120px] resize-none bg-slate-50"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-14 text-lg rounded-xl shadow-lg mt-8" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Confirm Appointment Request"}
                </Button>
                
              </form>
            </Form>

          </div>
        </div>
      </section>
    </div>
  );
}
