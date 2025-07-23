'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl bg-white border-gray-200">
        <AlertDialogHeader className="text-center pb-8">
          <AlertDialogTitle className="text-3xl font-bold text-gray-900 mb-6">
            Oops! Cart got a little too excited!
          </AlertDialogTitle>
          
          <AlertDialogDescription className="text-gray-700 space-y-6 text-left text-lg leading-relaxed">
            <p className="text-center">
              Sorry to be the bearer of disappointing news, but this is just a demo store! 
              No real money will be exchanged, no packages will arrive at your door, and 
              sadly, no actual tech goodies will be yours.
            </p>
            
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <p className="text-blue-900 text-center">
                <strong className="text-xl">What this demo actually showcases:</strong>
              </p>
              <p className="text-blue-800 mt-4 text-center">
                A fully functional AI-powered customer support chatbot that can help with 
                your cart, answer product questions, and provide store information!
              </p>
            </div>
            
            <p className="text-center">
              But hey, feel free to keep adding items to your cart and chatting with our 
              AI assistant - it's having a blast helping you out!
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="pt-8">
          <AlertDialogAction 
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
          >
            Got it! Back to testing the AI
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}