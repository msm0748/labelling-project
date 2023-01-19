import { ReactNode } from "react";

interface Props {
    header: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
}

function PageTemplate({ header, children, footer }: Props) {
    return (
        <>
            <header>{header}</header>
            <main>{children}</main>
            {footer}
        </>
    );
}

export default PageTemplate;
