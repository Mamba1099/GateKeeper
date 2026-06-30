"use client";

import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Lock } from "lucide-react";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "@/lib/validations/employee-schema";
import {
  useUpdateProfile,
  useChangePassword,
} from "@/hooks/mutations/use-employee";

interface ProfileFormProps {
  profile: {
    full_name: string;
    email: string;
    position: string;
    department_name: string;
  };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const profileForm = useForm({
    defaultValues: {
      full_name: profile.full_name || "",
      position: profile.position || "",
    },
    onSubmit: async ({ value }) => {
      await updateProfile.mutateAsync(value);
    },
    validators: {
      onChange: updateProfileSchema,
    },
  });

  const passwordForm = useForm({
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
    onSubmit: async ({ value }) => {
      await changePassword.mutateAsync({
        current_password: value.current_password,
        new_password: value.new_password,
        confirm_password: value.confirm_password,
      });
      passwordForm.reset();
    },
    validators: {
      onChange: changePasswordSchema,
    },
  });

  useEffect(() => {
    profileForm.setFieldValue("full_name", profile.full_name || "");
    profileForm.setFieldValue("position", profile.position || "");
  }, [profile, profileForm]);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-gray-900">
          Profile Settings
        </CardTitle>
        <CardDescription>
          Manage your personal information and security
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                profileForm.handleSubmit();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <profileForm.Field
                  name="full_name"
                  validators={{
                    onChange: updateProfileSchema.shape.full_name,
                  }}
                >
                  {(field) => {
                    const hasError = field.state.meta.errors.length > 0;
                    return (
                      <div className="space-y-2">
                        <Label
                          htmlFor={field.name}
                          className="text-sm font-medium text-gray-700"
                        >
                          Full Name
                        </Label>
                        <Input
                          id={field.name}
                          placeholder="Your full name"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className={`border-gray-200 focus:border-blue-500 ${
                            hasError
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                        />
                        {hasError && (
                          <p className="text-sm text-red-500">
                            {field.state.meta.errors.join(", ")}
                          </p>
                        )}
                      </div>
                    );
                  }}
                </profileForm.Field>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    value={profile.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-400">
                    Email cannot be changed
                  </p>
                </div>

                <profileForm.Field
                  name="position"
                  validators={{
                    onChange: updateProfileSchema.shape.position || "",
                  }}
                >
                  {(field) => {
                    const hasError = field.state.meta.errors.length > 0;
                    return (
                      <div className="space-y-2">
                        <Label
                          htmlFor={field.name}
                          className="text-sm font-medium text-gray-700"
                        >
                          Position
                        </Label>
                        <Input
                          id={field.name}
                          placeholder="Your position"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className={`border-gray-200 focus:border-blue-500 ${
                            hasError
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                        />
                        {hasError && (
                          <p className="text-sm text-red-500">
                            {field.state.meta.errors.join(", ")}
                          </p>
                        )}
                      </div>
                    );
                  }}
                </profileForm.Field>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Department
                  </Label>
                  <Input
                    value={profile.department_name}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <profileForm.Subscribe selector={(state) => state.canSubmit}>
                {(canSubmit) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || updateProfile.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {updateProfile.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                )}
              </profileForm.Subscribe>
            </form>
          </TabsContent>

          <TabsContent value="security">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                passwordForm.handleSubmit();
              }}
              className="space-y-4 max-w-md"
            >
              <passwordForm.Field
                name="current_password"
                validators={{
                  onChange: changePasswordSchema.shape.current_password,
                }}
              >
                {(field) => {
                  const hasError = field.state.meta.errors.length > 0;
                  return (
                    <div className="space-y-2">
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium text-gray-700"
                      >
                        Current Password
                      </Label>
                      <Input
                        id={field.name}
                        type="password"
                        placeholder="Enter current password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={`border-gray-200 focus:border-blue-500 ${
                          hasError
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                      />
                      {hasError && (
                        <p className="text-sm text-red-500">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                    </div>
                  );
                }}
              </passwordForm.Field>

              <passwordForm.Field
                name="new_password"
                validators={{
                  onChange: changePasswordSchema.shape.new_password,
                }}
              >
                {(field) => {
                  const hasError = field.state.meta.errors.length > 0;
                  return (
                    <div className="space-y-2">
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium text-gray-700"
                      >
                        New Password
                      </Label>
                      <Input
                        id={field.name}
                        type="password"
                        placeholder="Enter new password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={`border-gray-200 focus:border-blue-500 ${
                          hasError
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                      />
                      {hasError && (
                        <p className="text-sm text-red-500">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        Must be at least 8 characters with uppercase, lowercase,
                        number, and special character
                      </p>
                    </div>
                  );
                }}
              </passwordForm.Field>

              <passwordForm.Field
                name="confirm_password"
                validators={{
                  onChange: changePasswordSchema.shape.confirm_password,
                }}
              >
                {(field) => {
                  const hasError = field.state.meta.errors.length > 0;
                  return (
                    <div className="space-y-2">
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium text-gray-700"
                      >
                        Confirm New Password
                      </Label>
                      <Input
                        id={field.name}
                        type="password"
                        placeholder="Confirm new password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={`border-gray-200 focus:border-blue-500 ${
                          hasError
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                      />
                      {hasError && (
                        <p className="text-sm text-red-500">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                    </div>
                  );
                }}
              </passwordForm.Field>

              <passwordForm.Subscribe selector={(state) => state.canSubmit}>
                {(canSubmit) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || changePassword.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {changePassword.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                )}
              </passwordForm.Subscribe>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
