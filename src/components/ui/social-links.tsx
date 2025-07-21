import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe, Twitter, MessageCircle, Gamepad2 } from 'lucide-react';

interface SocialLinksProps {
  variant?: "default" | "compact";
  className?: string;
}

const SocialLinks: React.FC<SocialLinksProps> = ({ variant = "default", className = "" }) => {
  const socialLinks = [
    {
      name: "Website",
      url: "javascript:void(0)",
      icon: Globe,
      label: "Coming Soon...",
      disabled: true,
    },
    {
      name: "Twitter",
      url: "https://x.com/free_propfirm?s=09",
      icon: Twitter,
      label: "Follow us on Twitter",
      disabled: false,
    },
    {
      name: "Telegram",
      url: "https://telegram.dog/free_propfirm_accounts",
      icon: MessageCircle,
      label: "Join our Telegram",
      disabled: false,
    },
    {
      name: "Discord",
      url: "https://discord.gg/7MRsuqqT3n",
      icon: Gamepad2,
      label: "Join our Discord",
      disabled: false,
    },
  ];

  if (variant === "compact") {
    return (
      <div className={`flex gap-2 ${className}`}>
        {socialLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Button
              key={link.name}
              variant="outline"
              size="sm"
              disabled={link.disabled}
              onClick={() => {
                if (!link.disabled) {
                  window.open(link.url, '_blank', 'noopener,noreferrer');
                }
              }}
              className="h-8 w-8 p-0"
            >
              <Icon className="h-4 w-4" />
              <span className="sr-only">{link.label}</span>
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-semibold">Follow Us</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {socialLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Button
              key={link.name}
              variant="outline"
              disabled={link.disabled}
              onClick={() => {
                if (!link.disabled) {
                  window.open(link.url, '_blank', 'noopener,noreferrer');
                }
              }}
              className="justify-start gap-2 h-12"
            >
              <Icon className="h-5 w-5" />
              {link.disabled ? link.label : link.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default SocialLinks;