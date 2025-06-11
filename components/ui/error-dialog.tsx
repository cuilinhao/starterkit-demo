"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ErrorDetails {
  message: string;
  status?: number;
  statusText?: string;
  url?: string;
  timestamp: string;
  requestId?: string;
  errorCode?: string;
  stack?: string;
  response?: any;
}

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  error: ErrorDetails;
  onRetry?: () => void;
  showSupport?: boolean;
}

export function ErrorDialog({ 
  isOpen, 
  onClose, 
  error, 
  onRetry, 
  showSupport = true 
}: ErrorDialogProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyErrorDetails = async () => {
    const errorInfo = {
      timestamp: error.timestamp,
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      requestId: error.requestId,
      errorCode: error.errorCode,
      response: error.response,
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorInfo, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Error details copied to clipboard",
      });
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getStatusColor = (status?: number) => {
    if (!status) return "destructive";
    if (status >= 400 && status < 500) return "destructive";
    if (status >= 500) return "destructive";
    return "secondary";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Payment Error
          </DialogTitle>
          <DialogDescription>
            We encountered an error while processing your payment. Please review the details below.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[50vh] overflow-y-auto pr-4">
          <div className="space-y-4">
            {/* Main Error Message */}
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <h4 className="font-semibold text-destructive mb-2">Error Message</h4>
              <p className="text-sm text-foreground">{error.message}</p>
            </div>

            {/* Status Information */}
            {error.status && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status Code</label>
                  <div className="mt-1">
                    <Badge variant={getStatusColor(error.status)}>
                      {error.status}
                    </Badge>
                  </div>
                </div>
                {error.statusText && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status Text</label>
                    <p className="text-sm font-mono mt-1">{error.statusText}</p>
                  </div>
                )}
              </div>
            )}

            {/* Request Details */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Request Details</h4>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-xs font-mono">
                <div>
                  <span className="text-muted-foreground">Timestamp:</span>{" "}
                  <span className="text-foreground">{error.timestamp}</span>
                </div>
                {error.url && (
                  <div>
                    <span className="text-muted-foreground">URL:</span>{" "}
                    <span className="text-foreground break-all">{error.url}</span>
                  </div>
                )}
                {error.requestId && (
                  <div>
                    <span className="text-muted-foreground">Request ID:</span>{" "}
                    <span className="text-foreground">{error.requestId}</span>
                  </div>
                )}
                {error.errorCode && (
                  <div>
                    <span className="text-muted-foreground">Error Code:</span>{" "}
                    <span className="text-foreground">{error.errorCode}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Response Details */}
            {error.response && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Response Details</h4>
                <div className="bg-muted/50 rounded-lg p-3">
                  <pre className="text-xs font-mono whitespace-pre-wrap text-foreground">
                    {typeof error.response === 'string' 
                      ? error.response 
                      : JSON.stringify(error.response, null, 2)
                    }
                  </pre>
                </div>
              </div>
            )}

            {/* Common Solutions */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Possible Solutions
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Check your internet connection and try again</li>
                <li>• Verify your payment method is valid and has sufficient funds</li>
                <li>• Clear your browser cache and cookies</li>
                <li>• Try using a different browser or device</li>
                {error.status === 401 && (
                  <li>• Your session may have expired - please sign in again</li>
                )}
                {error.status && error.status >= 500 && (
                  <li>• Our servers are experiencing issues - please try again later</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={copyErrorDetails}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied!" : "Copy Details"}
          </Button>
          
          {showSupport && (
            <Button
              variant="outline"
              onClick={() => window.open("mailto:support@linhao.space?subject=Payment Error&body=" + encodeURIComponent(`Error Details:\n${JSON.stringify(error, null, 2)}`), "_blank")}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Contact Support
            </Button>
          )}
          
          {onRetry && (
            <Button
              onClick={onRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry Payment
            </Button>
          )}
          
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 