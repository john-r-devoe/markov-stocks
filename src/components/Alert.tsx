export default function Alert ({type, strong, message, onClose} : {
    type:string,
    strong:string,
    message:string,
    onClose: () => any
}){
    return (
        <div className={`alert alert-${type} alert-dismissible fade show`} role="alert">
            <strong>{strong}</strong> {message}
            <button type="button" className="btn-close shadow-none border-0" data-bs-dismiss="alert" aria-label="Close" onClick={onClose}></button>
        </div>
    )
}
