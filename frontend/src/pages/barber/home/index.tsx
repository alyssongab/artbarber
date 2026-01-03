import { Fragment } from "react/jsx-runtime";
import BarberMenu from "../../../components/features/users/BarberMenu";

export default function BarberHomePage(){
    return(
        <Fragment>
            <section id="barber-menu">
                <BarberMenu />
            </section>
            <section id="home-content">
                conteudo
            </section>
        </Fragment>
    )
}