import enum


class TipoBem(str, enum.Enum):
    MOVEL = "movel"
    IMOVEL = "imovel"