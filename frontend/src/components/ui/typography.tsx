import { cn } from "@/lib/utils";
import { FC } from "react"

interface HProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children?: React.ReactNode;
    className?: string;
}

interface PProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children?: React.ReactNode;
    className?: string;
}

interface SProps extends React.HTMLAttributes<HTMLElement> {
    children?: React.ReactNode;
    className?: string;
}

export const TypographyH1: FC<HProps> = ({children, className, ...props}) =>  {
    return (
      <h1 className={cn('scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl', className)} {...props}>
        {children}
      </h1>
    )
}

export const TypographyH2: FC<HProps> = ({children, className, ...props}) =>  {
    return (
        <h2 className={cn('scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0', className)} {...props}>
            {children}
        </h2>
    )
}

export const TypographyH3: FC<HProps> = ({children, className, ...props}) =>  {
    return (
      <h3 className={cn('scroll-m-20 text-2xl font-semibold tracking-tight', className)} {...props}>
        {children}
      </h3>
    )
}
  
export const TypographyH4: FC<HProps> = ({children, className, ...props}) =>  {
    return (
      <h4 className={cn('scroll-m-20 text-xl tracking-tight', className)} {...props}>
        {children}
      </h4>
    )
}

export const TypographyP: FC<PProps> = ({children, className, ...props}) =>  {
    return (
      <p  className={cn('leading-7', className)} {...props}>
        {children}
      </p>
    )
}

export const TypographySmall: FC<SProps> = ({children, className, ...props}) => {
    return (
      <small className={cn("text-sm font-medium leading-none", className)} {...props}>{children}</small>
    )
  }
  