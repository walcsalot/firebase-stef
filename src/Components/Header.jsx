import logo from './assets/react.svg';
function Header () {
    return (
        <>
        <header> <ul> <li> <img src={logo}/> </li>
        <li><a>Home</a></li> 
        <li><a>About</a></li>
        <li><a>Contact Sales</a></li>
        </ul> </header>
        </>
    )
}

export default Header